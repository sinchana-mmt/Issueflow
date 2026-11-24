import type { Prisma } from "@prisma/client";
import { ISSUE_STATUSES, PRIORITIES } from "@/lib/constants";
import { parseIssueKey } from "@/lib/keys";
import { addCalendarDays, todayIso } from "@/lib/reminders";

export type IssueListQuery = {
  q?: string;
  companyId?: string;
  status: string[];
  priority: string[];
  assigneeId?: string;
  tagId?: string;
  due?: "overdue" | "today" | "week" | "none";
  sort: "createdAt" | "updatedAt" | "priority" | "dueDate";
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
  archived: "active" | "archived" | "all";
  mine: boolean;
};

function many(value: string | string[] | undefined) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean);
}

function one(value: string | string[] | undefined) {
  const [first] = many(value);
  return first;
}

export function parseIssueQuery(
  input: Record<string, string | string[] | undefined>,
  defaults: Partial<IssueListQuery> = {},
): IssueListQuery {
  const page = Math.max(1, Number(one(input.page) || defaults.page || 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(one(input.pageSize) || defaults.pageSize || 25) || 25));
  const sortValue = one(input.sort);
  const sort = sortValue === "createdAt" || sortValue === "updatedAt" || sortValue === "priority" || sortValue === "dueDate"
    ? sortValue
    : defaults.sort || "updatedAt";
  const dir = one(input.dir) === "asc" || defaults.dir === "asc" ? "asc" : one(input.dir) === "desc" ? "desc" : defaults.dir || "desc";
  const archivedValue = one(input.archived);
  const archived = archivedValue === "archived" || archivedValue === "all" ? archivedValue : "active";
  const dueValue = one(input.due);
  const due = dueValue === "overdue" || dueValue === "today" || dueValue === "week" || dueValue === "none" ? dueValue : undefined;
  return {
    q: one(input.q) || undefined,
    companyId: one(input.companyId) || defaults.companyId,
    status: many(input.status).filter((status) => (ISSUE_STATUSES as readonly string[]).includes(status)),
    priority: many(input.priority).filter((priority) => (PRIORITIES as readonly string[]).includes(priority)),
    assigneeId: one(input.assigneeId) || defaults.assigneeId,
    tagId: one(input.tagId),
    due,
    sort,
    dir: dir === "asc" ? "asc" : "desc",
    page,
    pageSize,
    archived,
    mine: one(input.mine) === "1" || defaults.mine === true,
  };
}

export function issueWhere(
  actorId: string,
  isAdmin: boolean,
  query: IssueListQuery,
  timeZone: string,
): Prisma.IssueWhereInput {
  const where: Prisma.IssueWhereInput = {};
  const company: Prisma.CompanyWhereInput = {};
  if (!isAdmin) company.members = { some: { userId: actorId } };
  if (query.companyId) company.id = query.companyId;
  if (Object.keys(company).length > 0) where.company = company;
  if (query.status.length > 0) where.status = { in: query.status as never };
  if (query.priority.length > 0) where.priority = { in: query.priority as never };
  if (query.mine) where.assigneeId = actorId;
  else if (query.assigneeId === "unassigned") where.assigneeId = null;
  else if (query.assigneeId) where.assigneeId = query.assigneeId;
  if (query.tagId) where.tags = { some: { tagId: query.tagId } };
  if (query.archived === "active") where.archivedAt = null;
  if (query.archived === "archived") where.archivedAt = { not: null };

  const today = todayIso(timeZone);
  if (query.due === "overdue") {
    where.dueDate = { lt: new Date(`${today}T00:00:00.000Z`) };
    const statuses = (query.status.length ? query.status : [...ISSUE_STATUSES]).filter((status) => status !== "DONE");
    where.status = { in: statuses as never };
  } else if (query.due === "today") {
    where.dueDate = new Date(`${today}T00:00:00.000Z`);
  } else if (query.due === "week") {
    where.dueDate = {
      gte: new Date(`${today}T00:00:00.000Z`),
      lte: new Date(`${addCalendarDays(today, 7)}T00:00:00.000Z`),
    };
  } else if (query.due === "none") {
    where.dueDate = null;
  }

  if (query.q) {
    const key = parseIssueKey(query.q);
    if (key) {
      where.AND = [{ company: { key: key.companyKey } }, { number: key.number }];
    } else {
      where.title = { contains: query.q, mode: "insensitive" };
    }
  }
  return where;
}

export function issueOrder(query: IssueListQuery): Prisma.IssueOrderByWithRelationInput {
  if (query.sort === "dueDate") return { dueDate: { sort: query.dir, nulls: "last" } };
  return { [query.sort]: query.dir };
}
