import type { Role } from "@/lib/constants";

export type Actor = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export type Action =
  | "user.create"
  | "user.update"
  | "user.delete"
  | "company.create"
  | "company.member.manage"
  | "tag.manage"
  | "issue.create"
  | "issue.update"
  | "issue.delete"
  | "comment.create"
  | "attachment.upload"
  | "dependency.manage"
  | "export"
  | "settings.update"
  | "audit.read";

const userActions = new Set<Action>([
  "issue.create",
  "issue.update",
  "comment.create",
  "attachment.upload",
  "dependency.manage",
  "export",
]);

const adminActions = new Set<Action>([
  ...userActions,
  "user.create",
  "user.update",
  "company.member.manage",
  "tag.manage",
  "issue.delete",
]);

export function can(actor: Actor, action: Action) {
  if (!actor.active) return false;
  if (actor.role === "SUPERADMIN") return true;
  if (actor.role === "ADMIN") return adminActions.has(action);
  return userActions.has(action);
}
