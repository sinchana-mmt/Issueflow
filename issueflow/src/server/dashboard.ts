import { ISSUE_STATUSES } from "@/lib/constants";
import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { IssueListQuery } from "@/lib/issue-query";
import { listIssues } from "@/server/issues";
import { listNotifications } from "@/server/reminders";

const open = ISSUE_STATUSES.filter((status) => status !== "DONE");

function query(partial: Partial<IssueListQuery>): IssueListQuery {
  return {
    status: [],
    priority: [],
    sort: "updatedAt",
    dir: "desc",
    page: 1,
    pageSize: 6,
    archived: "active",
    mine: false,
    ...partial,
  };
}

export async function getDashboard(actor: Actor, companyId?: string) {
  const scope = {
    ...(companyId ? { companyId } : {}),
    ...(actor.role === "SUPERADMIN" ? {} : { company: { members: { some: { userId: actor.id } } } }),
  };
  const activeWhere = { archivedAt: null, ...scope };
  const scoped = query(companyId ? { companyId } : {});
  const [active, mine, inProgress, blocked, done, upcoming, recent, assigned, notifications] = await Promise.all([
    prisma.issue.count({ where: { ...activeWhere, status: { not: "DONE" } } }),
    prisma.issue.count({ where: { ...activeWhere, assigneeId: actor.id, status: { not: "DONE" } } }),
    prisma.issue.count({ where: { ...activeWhere, status: "IN_PROGRESS" } }),
    prisma.issue.count({ where: { ...activeWhere, status: "BLOCKED" } }),
    prisma.issue.count({ where: { ...activeWhere, status: "DONE" } }),
    listIssues(actor, { ...scoped, due: "week", status: [...open], sort: "dueDate", dir: "asc" }),
    listIssues(actor, scoped),
    listIssues(actor, { ...scoped, mine: true, status: [...open] }),
    listNotifications(actor),
  ]);
  return {
    counts: { active, mine, inProgress, blocked, done },
    upcoming: upcoming.issues,
    recent: recent.issues,
    assigned: assigned.issues,
    notifications: notifications.notifications.slice(0, 5),
    unread: notifications.unread,
  };
}
