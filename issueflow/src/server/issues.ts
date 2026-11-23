import type { Prisma } from "@prisma/client";
import { STATUS_LABEL, TYPE_LABEL, PRIORITY_LABEL } from "@/lib/constants";
import { AppError, conflict } from "@/lib/errors";
import { formatIssueKey } from "@/lib/keys";
import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { rankAtEnd, rankBeside } from "@/lib/ranks";
import { issueOrder, issueWhere, parseIssueQuery, type IssueListQuery } from "@/lib/issue-query";
import type { IssueCard } from "@/lib/types";
import { bulkSchema, issueCreateSchema, issuePatchSchema, parseBody } from "@/lib/validators";
import { assertAssignee, assertCan, assertIssue, assertProject, writeActivity } from "@/server/access";
import { getSettings } from "@/server/settings";
import { notify } from "@/server/notifications";

const listInclude = {
  project: { select: { id: true, key: true, name: true, status: true } },
  assignee: { select: { id: true, name: true } },
  reporter: { select: { id: true, name: true } },
  tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
  parent: { select: { id: true, number: true, title: true, project: { select: { key: true } } } },
  children: { select: { status: true } },
} satisfies Prisma.IssueInclude;

type ListRow = Prisma.IssueGetPayload<{ include: typeof listInclude }>;

export async function listIssues(actor: Actor, query: IssueListQuery) {
  const settings = await getSettings();
  const where = issueWhere(actor.id, actor.role === "SUPERADMIN", query, settings.timezone);
  const [total, rows] = await prisma.$transaction([
    prisma.issue.count({ where }),
    prisma.issue.findMany({
      where,
      include: listInclude,
      orderBy: issueOrder(query),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);
  return { issues: rows.map(serializeCard), total, page: query.page, pageSize: query.pageSize };
}

export async function listBoard(actor: Actor, source: Record<string, string | string[] | undefined>) {
  const query = parseIssueQuery(source, { page: 1, pageSize: 100, archived: "active", sort: "updatedAt", dir: "desc" });
  const result = await listIssues(actor, { ...query, page: 1, pageSize: 500 });
  return { ...result, capped: result.total > result.issues.length };
}

export function issuesFromRequest(actor: Actor, source: Record<string, string | string[] | undefined>) {
  return listIssues(actor, parseIssueQuery(source, { mine: false }));
}

export async function getIssue(actor: Actor, issueId: string) {
  await assertIssue(actor, issueId);
  const issue = await prisma.issue.findUniqueOrThrow({
    where: { id: issueId },
    include: {
      ...listInclude,
      comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
      attachments: { include: { uploadedBy: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      activities: { include: { actor: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 100 },
      blocking: { include: { related: { include: { project: { select: { key: true } } } } } },
      blockedBy: { include: { issue: { include: { project: { select: { key: true } } } } } },
    },
  });
  const children = await prisma.issue.findMany({
    where: { parentId: issue.id },
    include: listInclude,
    orderBy: { number: "asc" },
  });
  const card = serializeCard(issue);
  const outgoing = issue.blocking.map((row) => ({
    id: row.id,
    type: row.type,
    direction: "out" as const,
    label: row.type === "BLOCKS" ? "Blocks" : row.type === "RELATES" ? "Relates to" : "Duplicates",
    issue: brief(row.related),
  }));
  const incoming = issue.blockedBy
    .filter((row) => row.type === "BLOCKS" || row.type === "RELATES" || row.type === "DUPLICATES")
    .map((row) => ({
      id: row.id,
      type: row.type,
      direction: "in" as const,
      label: row.type === "BLOCKS" ? "Is blocked by" : row.type === "RELATES" ? "Relates to" : "Duplicates",
      issue: brief(row.issue),
    }));
  return {
    ...card,
    description: issue.description || "",
    reporter: issue.reporter,
    createdAt: issue.createdAt.toISOString(),
    children: children.map(serializeCard),
    comments: issue.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      author: comment.author,
      own: comment.authorId === actor.id,
    })),
    attachments: issue.attachments.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      createdAt: file.createdAt.toISOString(),
      uploadedBy: file.uploadedBy,
      preview: file.mimeType.startsWith("image/"),
    })),
    activity: issue.activities.map((entry) => ({
      id: entry.id,
      action: entry.action,
      field: entry.field,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      createdAt: entry.createdAt.toISOString(),
      actor: entry.actor,
    })),
    dependencies: [...outgoing, ...incoming],
  };
}

export async function createIssue(actor: Actor, body: unknown) {
  assertCan(actor, "issue.create");
  const input = parseBody(issueCreateSchema, body);
  const project = await assertProject(actor, input.projectId, true);
  await assertAssignee(project.id, input.assigneeId);
  if (input.parentId) await assertParent(actor, input.parentId, project.id);
  if (input.tagIds?.length) await assertTags(project.id, input.tagIds);
  const issueId = await prisma.$transaction(async (tx) => {
    const updated = await tx.project.update({
      where: { id: project.id },
      data: { nextIssueNumber: { increment: 1 } },
      select: { nextIssueNumber: true },
    });
    const number = updated.nextIssueNumber - 1;
    const max = await tx.issue.aggregate({
      where: { projectId: project.id, status: input.status },
      _max: { rank: true },
    });
    const created = await tx.issue.create({
      data: {
        projectId: project.id,
        number,
        title: input.title,
        description: input.description || null,
        type: input.type,
        status: input.status,
        priority: input.priority,
        assigneeId: input.assigneeId || null,
        reporterId: actor.id,
        dueDate: asDate(input.dueDate),
        parentId: input.parentId || null,
        rank: rankAtEnd(max._max.rank),
        tags: input.tagIds?.length ? { create: input.tagIds.map((tagId) => ({ tagId })) } : undefined,
      },
    });
    await writeActivity(tx, { issueId: created.id, actorId: actor.id, action: "ISSUE_CREATED", newValue: input.title });
    if (input.assigneeId && input.assigneeId !== actor.id) {
      await notify(tx, {
        userId: input.assigneeId,
        type: "ASSIGNED",
        issueId: created.id,
        title: `Assigned ${formatIssueKey(project.key, number)}`,
        body: input.title,
      });
    }
    return created.id;
  });
  return getIssue(actor, issueId);
}

export async function updateIssue(actor: Actor, issueId: string, body: unknown) {
  assertCan(actor, "issue.update");
  const input = parseBody(issuePatchSchema, body);
  const current = await assertIssue(actor, issueId);
  if (input.updatedAt && current.updatedAt.toISOString() !== input.updatedAt) {
    throw conflict("This issue was updated by someone else. Refresh and try again.");
  }
  if (current.archivedAt && input.archived !== false) {
    throw new AppError(400, "VALIDATION_ERROR", "Restore the issue before editing it");
  }
  if (current.project.status === "ARCHIVED") {
    throw new AppError(400, "VALIDATION_ERROR", "This project is archived");
  }
  if (input.assigneeId) await assertAssignee(current.projectId, input.assigneeId);
  if (input.tagIds) await assertTags(current.projectId, input.tagIds);

  await prisma.$transaction(async (tx) => {
    const data: Prisma.IssueUpdateInput = {};
    const changes: { action: string; field: string; oldValue: string | null; newValue: string | null }[] = [];
    if (input.title != null && input.title !== current.title) {
      data.title = input.title;
      changes.push({ action: "TITLE_CHANGED", field: "title", oldValue: current.title, newValue: input.title });
    }
    if (input.description !== undefined && (input.description || "") !== (current.description || "")) {
      data.description = input.description;
      changes.push({ action: "DESCRIPTION_CHANGED", field: "description", oldValue: current.description, newValue: input.description });
    }
    if (input.type && input.type !== current.type) {
      data.type = input.type;
      changes.push({ action: "TYPE_CHANGED", field: "type", oldValue: TYPE_LABEL[current.type], newValue: TYPE_LABEL[input.type] });
    }
    if (input.priority && input.priority !== current.priority) {
      data.priority = input.priority;
      changes.push({ action: "PRIORITY_CHANGED", field: "priority", oldValue: PRIORITY_LABEL[current.priority], newValue: PRIORITY_LABEL[input.priority] });
    }
    if (input.dueDate !== undefined && input.dueDate !== dateLabel(current.dueDate)) {
      data.dueDate = asDate(input.dueDate);
      changes.push({ action: "DUE_DATE_CHANGED", field: "dueDate", oldValue: dateLabel(current.dueDate), newValue: input.dueDate });
    }
    if (input.assigneeId !== undefined && input.assigneeId !== current.assigneeId) {
      data.assignee = input.assigneeId ? { connect: { id: input.assigneeId } } : { disconnect: true };
      const nextName = input.assigneeId
        ? (await tx.user.findUnique({ where: { id: input.assigneeId }, select: { name: true } }))?.name || "Member"
        : "Unassigned";
      changes.push({
        action: "ASSIGNEE_CHANGED",
        field: "assignee",
        oldValue: current.assignee?.name || "Unassigned",
        newValue: nextName,
      });
    }
    if (input.archived != null && Boolean(current.archivedAt) !== input.archived) {
      data.archivedAt = input.archived ? new Date() : null;
      changes.push({ action: input.archived ? "ARCHIVED" : "RESTORED", field: "archived", oldValue: null, newValue: null });
    }
    const nextStatus = input.status || current.status;
    if (input.status && input.status !== current.status) {
      data.status = input.status;
      changes.push({
        action: "STATUS_CHANGED",
        field: "status",
        oldValue: STATUS_LABEL[current.status],
        newValue: STATUS_LABEL[input.status],
      });
    }
    if (input.status || input.overIssueId) {
      data.rank = await resolveRank(tx, current.projectId, nextStatus, current.id, input.overIssueId, input.place);
    }
    if (input.tagIds) {
      const oldNames = current.tags.map((row) => row.tag.name).sort().join(", ");
      const nextTags = await tx.tag.findMany({ where: { id: { in: input.tagIds } }, select: { name: true } });
      const newNames = nextTags.map((tag) => tag.name).sort().join(", ");
      if (oldNames !== newNames) {
        await tx.issueTag.deleteMany({ where: { issueId: current.id } });
        if (input.tagIds.length) {
          await tx.issueTag.createMany({ data: input.tagIds.map((tagId) => ({ issueId: current.id, tagId })) });
        }
        changes.push({ action: "TAGS_CHANGED", field: "tags", oldValue: oldNames || "None", newValue: newNames || "None" });
      }
    }
    if (Object.keys(data).length > 0) {
      await tx.issue.update({ where: { id: current.id }, data });
    }
    for (const change of changes) {
      await writeActivity(tx, { issueId: current.id, actorId: actor.id, ...change });
    }
    if (input.assigneeId && input.assigneeId !== current.assigneeId && input.assigneeId !== actor.id) {
      const key = formatIssueKey(current.project.key, current.number);
      await notify(tx, {
        userId: input.assigneeId,
        type: "ASSIGNED",
        issueId: current.id,
        title: `Assigned ${key}`,
        body: input.title || current.title,
      });
    }
  });
  return getIssue(actor, issueId);
}

export async function deleteIssue(actor: Actor, issueId: string) {
  assertCan(actor, "issue.delete");
  const issue = await assertIssue(actor, issueId);
  const tree = await prisma.issue.findMany({
    where: { OR: [{ id: issue.id }, { parentId: issue.id }] },
    select: { attachments: { select: { storedName: true } } },
  });
  await prisma.issue.delete({ where: { id: issue.id } });
  const { removeStoredFiles } = await import("@/server/attachments");
  await removeStoredFiles(tree.flatMap((row) => row.attachments.map((file) => file.storedName)));
  return { deleted: true };
}

export async function duplicateIssue(actor: Actor, issueId: string) {
  assertCan(actor, "issue.create");
  const source = await assertIssue(actor, issueId);
  if (source.project.status === "ARCHIVED") {
    throw new AppError(400, "VALIDATION_ERROR", "This project is archived");
  }
  const copyId = await prisma.$transaction(async (tx) => {
    const updated = await tx.project.update({
      where: { id: source.projectId },
      data: { nextIssueNumber: { increment: 1 } },
      select: { nextIssueNumber: true, key: true },
    });
    const max = await tx.issue.aggregate({
      where: { projectId: source.projectId, status: source.status },
      _max: { rank: true },
    });
    const created = await tx.issue.create({
      data: {
        projectId: source.projectId,
        number: updated.nextIssueNumber - 1,
        title: source.title,
        description: source.description,
        type: source.type,
        status: source.status,
        priority: source.priority,
        reporterId: actor.id,
        dueDate: source.dueDate,
        parentId: source.parentId,
        rank: rankAtEnd(max._max.rank),
        tags: { create: source.tags.map((row) => ({ tagId: row.tagId })) },
      },
    });
    const key = formatIssueKey(updated.key, created.number);
    await writeActivity(tx, { issueId: created.id, actorId: actor.id, action: "ISSUE_CREATED", newValue: `Duplicated from ${formatIssueKey(source.project.key, source.number)}` });
    await writeActivity(tx, { issueId: source.id, actorId: actor.id, action: "DUPLICATED", newValue: key });
    return created.id;
  });
  return getIssue(actor, copyId);
}

export async function bulkUpdate(actor: Actor, body: unknown) {
  assertCan(actor, "issue.update");
  const input = parseBody(bulkSchema, body);
  let updated = 0;
  const skipped: string[] = [];
  for (const id of input.ids) {
    try {
      await updateIssue(actor, id, {
        status: input.status,
        assigneeId: input.assigneeId,
        tagIds: undefined,
        archived: input.archive,
      });
      if (input.addTagId || input.removeTagId) {
        const issue = await assertIssue(actor, id);
        const ids = new Set(issue.tags.map((row) => row.tagId));
        if (input.addTagId) ids.add(input.addTagId);
        if (input.removeTagId) ids.delete(input.removeTagId);
        await updateIssue(actor, id, { tagIds: [...ids] });
      }
      updated += 1;
    } catch {
      skipped.push(id);
    }
  }
  return { updated, skipped };
}

export async function exportIssues(actor: Actor, source: Record<string, string | string[] | undefined>) {
  assertCan(actor, "export");
  const query = parseIssueQuery(source, { page: 1, pageSize: 100 });
  const settings = await getSettings();
  const where = issueWhere(actor.id, actor.role === "SUPERADMIN", query, settings.timezone);
  const rows = await prisma.issue.findMany({
    where,
    include: listInclude,
    orderBy: issueOrder(query),
    take: 5000,
  });
  return rows.map(serializeCard);
}

async function assertParent(actor: Actor, parentId: string, projectId: string) {
  const parent = await assertIssue(actor, parentId);
  if (parent.projectId !== projectId) throw new AppError(400, "VALIDATION_ERROR", "Subtasks stay in the parent project");
  if (parent.parentId) throw new AppError(400, "VALIDATION_ERROR", "Subtasks can only be one level deep");
}

async function assertTags(projectId: string, tagIds: string[]) {
  if (tagIds.length === 0) return;
  const count = await prisma.tag.count({ where: { projectId, id: { in: tagIds } } });
  if (count !== new Set(tagIds).size) throw new AppError(400, "VALIDATION_ERROR", "Tags must belong to the issue project");
}

async function resolveRank(
  tx: Prisma.TransactionClient,
  projectId: string,
  status: ListRow["status"],
  issueId: string,
  overIssueId?: string,
  place?: "before" | "after",
) {
  if (!overIssueId) {
    const max = await tx.issue.aggregate({ where: { projectId, status, NOT: { id: issueId } }, _max: { rank: true } });
    return rankAtEnd(max._max.rank);
  }
  const over = await tx.issue.findFirst({ where: { id: overIssueId, projectId, status } });
  if (!over) return rankAtEnd(null);
  const side = place || "before";
  const neighbor = await tx.issue.findFirst({
    where: {
      projectId,
      status,
      id: { notIn: [issueId, over.id] },
      rank: side === "before" ? { lt: over.rank } : { gt: over.rank },
    },
    orderBy: { rank: side === "before" ? "desc" : "asc" },
  });
  return rankBeside(over.rank, neighbor?.rank ?? null, side);
}

function brief(issue: { id: string; number: number; title: string; status: string; project: { key: string } }) {
  return { id: issue.id, key: formatIssueKey(issue.project.key, issue.number), title: issue.title, status: issue.status };
}

export function serializeCard(issue: ListRow): IssueCard {
  return {
    id: issue.id,
    key: formatIssueKey(issue.project.key, issue.number),
    number: issue.number,
    title: issue.title,
    description: issue.description || "",
    status: issue.status,
    priority: issue.priority,
    type: issue.type,
    dueDate: dateLabel(issue.dueDate),
    updatedAt: issue.updatedAt.toISOString(),
    createdAt: issue.createdAt.toISOString(),
    archivedAt: issue.archivedAt?.toISOString() ?? null,
    rank: issue.rank,
    project: { id: issue.project.id, key: issue.project.key, name: issue.project.name },
    assignee: issue.assignee,
    reporter: issue.reporter,
    tags: issue.tags.map((row) => row.tag),
    parent: issue.parent
      ? { id: issue.parent.id, key: formatIssueKey(issue.parent.project.key, issue.parent.number), title: issue.parent.title }
      : null,
    subtaskDone: issue.children.filter((child) => child.status === "DONE").length,
    subtaskTotal: issue.children.length,
  };
}

function asDate(value: string | null | undefined) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function dateLabel(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}
