import type { Prisma } from "@prisma/client";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { can, type Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const membership = (actor: Actor) => ({ where: { userId: actor.id }, select: { userId: true } });

export async function assertProject(actor: Actor, projectId: string, write = false) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: membership(actor) },
  });
  if (!project || (actor.role !== "SUPERADMIN" && project.members.length === 0)) throw notFound("Project not found");
  if (write && project.status === "ARCHIVED") {
    throw new AppError(400, "VALIDATION_ERROR", "This project is archived");
  }
  return project;
}

export async function assertIssue(actor: Actor, issueId: string) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      project: { include: { members: membership(actor) } },
      assignee: { select: { id: true, name: true } },
      tags: { select: { tagId: true, tag: { select: { id: true, name: true, color: true } } } },
    },
  });
  if (!issue || (actor.role !== "SUPERADMIN" && issue.project.members.length === 0)) throw notFound("Issue not found");
  return issue;
}

export function assertCan(actor: Actor, action: Parameters<typeof can>[1]) {
  if (!can(actor, action)) throw forbidden();
}

export async function assertAssignee(projectId: string, assigneeId: string | null | undefined) {
  if (!assigneeId) return;
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: assigneeId } },
    include: { user: { select: { active: true, name: true } } },
  });
  if (!member?.user.active) {
    throw new AppError(400, "VALIDATION_ERROR", "Assignee must be an active project member");
  }
  return member.user.name;
}

export async function writeActivity(
  tx: Prisma.TransactionClient,
  input: {
    issueId: string;
    actorId: string;
    action: string;
    field?: string;
    oldValue?: string | null;
    newValue?: string | null;
  },
) {
  await tx.activityLog.create({
    data: {
      issueId: input.issueId,
      actorId: input.actorId,
      action: input.action,
      field: input.field,
      oldValue: clip(input.oldValue),
      newValue: clip(input.newValue),
    },
  });
}

function clip(value: string | null | undefined) {
  if (value == null) return null;
  return value.length > 500 ? `${value.slice(0, 497)}...` : value;
}

export async function audit(actorId: string, action: string, targetType: string, targetId?: string, metadata?: string) {
  await prisma.adminAudit.create({
    data: { actorId, action, targetType, targetId, metadata },
  });
}
