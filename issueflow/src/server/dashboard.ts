import { ISSUE_STATUSES } from "@/lib/constants";
import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { IssueListQuery } from "@/lib/issue-query";
import { listIssues } from "@/server/issues";
import { listNotifications } from "@/server/reminders";
import { listProjects } from "@/server/projects";

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

export async function getDashboard(actor: Actor) {
  const scope = actor.role === "SUPERADMIN" ? {} : { project: { members: { some: { userId: actor.id } } } };
  const activeWhere = { archivedAt: null, ...scope };
  const [active, mine, inProgress, blocked, done, upcoming, recent, assigned, projects, notifications] = await Promise.all([
    prisma.issue.count({ where: { ...activeWhere, status: { not: "DONE" } } }),
    prisma.issue.count({ where: { ...activeWhere, assigneeId: actor.id, status: { not: "DONE" } } }),
    prisma.issue.count({ where: { ...activeWhere, status: "IN_PROGRESS" } }),
    prisma.issue.count({ where: { ...activeWhere, status: "BLOCKED" } }),
    prisma.issue.count({ where: { ...activeWhere, status: "DONE" } }),
    listIssues(actor, query({ due: "week", status: [...open], sort: "dueDate", dir: "asc" })),
    listIssues(actor, query({ sort: "updatedAt" })),
    listIssues(actor, query({ mine: true, status: [...open] })),
    listProjects(actor),
    listNotifications(actor),
  ]);
  return {
    counts: { active, mine, inProgress, blocked, done },
    upcoming: upcoming.issues,
    recent: recent.issues,
    assigned: assigned.issues,
    projects: projects.filter((project) => project.status === "ACTIVE").slice(0, 6),
    notifications: notifications.notifications.slice(0, 5),
    unread: notifications.unread,
  };
}
