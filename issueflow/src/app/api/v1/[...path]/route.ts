import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import type { IssueCard } from "@/lib/types";
import { api, queryRecord, readJson } from "@/server/http";
import { saveAttachment, readAttachment, deleteAttachment } from "@/server/attachments";
import { addComment, deleteComment, updateComment } from "@/server/comments";
import { getDashboard } from "@/server/dashboard";
import { addDependency, removeDependency } from "@/server/dependencies";
import { createFilter, deleteFilter, listFilters } from "@/server/filters";
import {
  bulkUpdate,
  createIssue,
  deleteIssue,
  duplicateIssue,
  exportIssues,
  getIssue,
  issuesFromRequest,
  listBoard,
  updateIssue,
} from "@/server/issues";
import { listNotifications, markRead } from "@/server/reminders";
import {
  addMember,
  createCompany,
  createTag,
  deleteTag,
  getCompany,
  listCompanies,
  listTags,
  removeMember,
  updateCompany,
  updateTag,
} from "@/server/companies";
import { settingsView, updateSettings } from "@/server/settings";
import { changeOwnPassword, createUser, deleteUser, listPeople, listUsers, updateUser } from "@/server/users";
import { prisma } from "@/lib/prisma";
import type { Actor } from "@/lib/permissions";

type Route = {
  method: string;
  pattern: string;
  handle: (actor: Actor, request: Request, params: Record<string, string>) => Promise<unknown>;
};

const routes: Route[] = [
  { method: "GET", pattern: "dashboard", handle: (actor) => getDashboard(actor) },
  { method: "GET", pattern: "users", handle: (actor) => listUsers(actor) },
  { method: "GET", pattern: "people", handle: (actor) => listPeople(actor) },
  { method: "POST", pattern: "users", handle: (actor, request) => readJson(request).then((body) => createUser(actor, body)) },
  { method: "PATCH", pattern: "users/:id", handle: (actor, request, params) => readJson(request).then((body) => updateUser(actor, params.id, body)) },
  { method: "DELETE", pattern: "users/:id", handle: (actor, _request, params) => deleteUser(actor, params.id) },
  { method: "POST", pattern: "users/me/password", handle: (actor, request) => readJson(request).then((body) => changeOwnPassword(actor, body)) },
  { method: "GET", pattern: "companies", handle: (actor) => listCompanies(actor) },
  { method: "POST", pattern: "companies", handle: (actor, request) => readJson(request).then((body) => createCompany(actor, body)) },
  { method: "GET", pattern: "companies/:id", handle: (actor, _request, params) => getCompany(actor, params.id) },
  { method: "PATCH", pattern: "companies/:id", handle: (actor, request, params) => readJson(request).then((body) => updateCompany(actor, params.id, body)) },
  { method: "POST", pattern: "companies/:id/members", handle: (actor, request, params) => readJson(request).then((body) => addMember(actor, params.id, body)) },
  { method: "DELETE", pattern: "companies/:id/members/:userId", handle: (actor, _request, params) => removeMember(actor, params.id, params.userId) },
  { method: "GET", pattern: "companies/:id/tags", handle: (actor, _request, params) => listTags(actor, params.id) },
  { method: "POST", pattern: "companies/:id/tags", handle: (actor, request, params) => readJson(request).then((body) => createTag(actor, params.id, body)) },
  { method: "GET", pattern: "tags", handle: (actor) => listTags(actor) },
  { method: "PATCH", pattern: "tags/:id", handle: (actor, request, params) => readJson(request).then((body) => updateTag(actor, params.id, body)) },
  { method: "DELETE", pattern: "tags/:id", handle: (actor, _request, params) => deleteTag(actor, params.id) },
  { method: "GET", pattern: "issues", handle: (actor, request) => issuesFromRequest(actor, queryRecord(request)) },
  { method: "POST", pattern: "issues", handle: (actor, request) => readJson(request).then((body) => createIssue(actor, body)) },
  { method: "POST", pattern: "issues/bulk", handle: (actor, request) => readJson(request).then((body) => bulkUpdate(actor, body)) },
  { method: "GET", pattern: "board", handle: (actor, request) => listBoard(actor, queryRecord(request)) },
  { method: "GET", pattern: "issues/:id", handle: (actor, _request, params) => getIssue(actor, params.id) },
  { method: "PATCH", pattern: "issues/:id", handle: (actor, request, params) => readJson(request).then((body) => updateIssue(actor, params.id, body)) },
  { method: "DELETE", pattern: "issues/:id", handle: (actor, _request, params) => deleteIssue(actor, params.id) },
  { method: "POST", pattern: "issues/:id/duplicate", handle: (actor, _request, params) => duplicateIssue(actor, params.id) },
  { method: "GET", pattern: "issues/:id/subtasks", handle: (actor, _request, params) => getIssue(actor, params.id).then((issue) => issue.children) },
  { method: "POST", pattern: "issues/:id/subtasks", handle: async (actor, request, params) => {
    const parent = await getIssue(actor, params.id);
    const body = await readJson(request);
    return createIssue(actor, { ...(body as object), companyId: parent.company.id, parentId: parent.id });
  } },
  { method: "GET", pattern: "issues/:id/comments", handle: (actor, _request, params) => getIssue(actor, params.id).then((issue) => issue.comments) },
  { method: "POST", pattern: "issues/:id/comments", handle: (actor, request, params) => readJson(request).then((body) => addComment(actor, params.id, body)) },
  { method: "PATCH", pattern: "comments/:id", handle: (actor, request, params) => readJson(request).then((body) => updateComment(actor, params.id, body)) },
  { method: "DELETE", pattern: "comments/:id", handle: (actor, _request, params) => deleteComment(actor, params.id) },
  { method: "POST", pattern: "issues/:id/attachments", handle: async (actor, request, params) => {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new AppError(400, "VALIDATION_ERROR", "Choose a file to upload");
    return saveAttachment(actor, params.id, file);
  } },
  { method: "GET", pattern: "attachments/:id", handle: async (actor, _request, params) => {
    const { file, bytes } = await readAttachment(actor, params.id);
    const inline = file.mimeType.startsWith("image/") || file.mimeType === "application/pdf";
    const filename = file.fileName.replace(/["\r\n]/g, "");
    return new Response(Buffer.from(bytes), {
      headers: {
        "content-type": file.mimeType,
        "content-disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
        "x-content-type-options": "nosniff",
        "cache-control": "private, no-store",
      },
    });
  } },
  { method: "DELETE", pattern: "attachments/:id", handle: (actor, _request, params) => deleteAttachment(actor, params.id) },
  { method: "GET", pattern: "issues/:id/dependencies", handle: (actor, _request, params) => getIssue(actor, params.id).then((issue) => issue.dependencies) },
  { method: "POST", pattern: "issues/:id/dependencies", handle: (actor, request, params) => readJson(request).then((body) => addDependency(actor, params.id, body)) },
  { method: "DELETE", pattern: "dependencies/:id", handle: (actor, _request, params) => removeDependency(actor, params.id) },
  { method: "GET", pattern: "issues/:id/activity", handle: (actor, _request, params) => getIssue(actor, params.id).then((issue) => issue.activity) },
  { method: "GET", pattern: "notifications", handle: (actor) => listNotifications(actor) },
  { method: "POST", pattern: "notifications/read", handle: (actor, request) => readJson(request).then((body) => markRead(actor, body as { id?: string; all?: boolean })) },
  { method: "GET", pattern: "filters", handle: (actor) => listFilters(actor) },
  { method: "POST", pattern: "filters", handle: (actor, request) => readJson(request).then((body) => createFilter(actor, body)) },
  { method: "DELETE", pattern: "filters/:id", handle: (actor, _request, params) => deleteFilter(actor, params.id) },
  { method: "GET", pattern: "settings", handle: (actor) => settingsView(actor) },
  { method: "PATCH", pattern: "settings", handle: (actor, request) => readJson(request).then((body) => updateSettings(actor, body)) },
  { method: "GET", pattern: "audit", handle: async (actor) => {
    if (actor.role !== "SUPERADMIN") throw new AppError(403, "FORBIDDEN", "You do not have permission to do that");
    const rows = await prisma.adminAudit.findMany({
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
      actor: row.actor.name,
    }));
  } },
  { method: "GET", pattern: "exports/issues.csv", handle: async (actor, request) => csvResponse(await exportIssues(actor, queryRecord(request))) },
  { method: "GET", pattern: "exports/issues.json", handle: async (actor, request) => {
    const issues = await exportIssues(actor, queryRecord(request));
    return new Response(JSON.stringify({ success: true, data: { issues }, message: "Operation completed successfully" }, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": "attachment; filename=\"issues.json\"",
      },
    });
  } },
];

function csvResponse(issues: IssueCard[]) {
  const header = ["Key", "Title", "Company", "Type", "Status", "Priority", "Assignee", "Reporter", "Due", "Tags", "Updated"];
  const lines = issues.map((issue) =>
    [issue.key, issue.title, issue.company.key, issue.type, issue.status, issue.priority, issue.assignee?.name || "", issue.reporter.name, issue.dueDate || "", issue.tags.map((tag) => tag.name).join("|"), issue.updatedAt]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );
  return new NextResponse([header.join(","), ...lines].join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=\"issues.csv\"",
    },
  });
}

function match(method: string, parts: string[]) {
  for (const route of routes) {
    if (route.method !== method) continue;
    const segments = route.pattern.split("/");
    if (segments.length !== parts.length) continue;
    const params: Record<string, string> = {};
    let matched = true;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      if (segment.startsWith(":")) params[segment.slice(1)] = decodeURIComponent(parts[index]);
      else if (segment !== parts[index]) matched = false;
    }
    if (matched) return { route, params };
  }
  return null;
}

async function dispatch(request: Request, parts: string[]) {
  const found = match(request.method, parts);
  if (!found) return null;
  return found.route.handle;
}

function handler(method: string) {
  return api(async (actor, request, params) => {
    const parts = (params.path || "").split("/").filter(Boolean);
    const found = match(method, parts);
    if (!found) throw new AppError(404, "NOT_FOUND", "Unknown endpoint");
    return found.route.handle(actor, request, found.params);
  });
}

export const GET = handler("GET");
export const POST = handler("POST");
export const PATCH = handler("PATCH");
export const DELETE = handler("DELETE");

void dispatch;
