export const ROLES = ["SUPERADMIN", "ADMIN", "USER"] as const;
export type Role = (typeof ROLES)[number];

export const DEFAULT_USER_PASSWORD = "Admin@1234";

export const ISSUE_TYPES = ["BUG", "TASK", "STORY", "FEATURE", "RESEARCH"] as const;
export type IssueType = (typeof ISSUE_TYPES)[number];

export const ISSUE_STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const DEPENDENCY_TYPES = ["BLOCKS", "RELATES", "DUPLICATES"] as const;
export const LINK_TYPES = ["BLOCKS", "BLOCKED_BY", "RELATES", "DUPLICATES"] as const;

export const STATUS_LABEL: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  BLOCKED: "Blocked",
  DONE: "Done",
};

export const PRIORITY_LABEL: Record<string, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const TYPE_LABEL: Record<string, string> = {
  BUG: "Bug",
  TASK: "Task",
  STORY: "Story",
  FEATURE: "Feature",
  RESEARCH: "Research",
};

export const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin",
  USER: "User",
};

export const TAG_COLORS = ["#6366f1", "#3dd68c", "#f5b942", "#f07178", "#22d3ee", "#c084fc", "#fb923c", "#94a3b8"];

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

export const ACTIVITY_LABEL: Record<string, string> = {
  ISSUE_CREATED: "created the issue",
  TITLE_CHANGED: "changed the title",
  DESCRIPTION_CHANGED: "changed the description",
  STATUS_CHANGED: "changed the status",
  PRIORITY_CHANGED: "changed the priority",
  TYPE_CHANGED: "changed the type",
  ASSIGNEE_CHANGED: "changed the assignee",
  TAGS_CHANGED: "changed tags",
  DUE_DATE_CHANGED: "changed the due date",
  COMMENT_ADDED: "added a comment",
  COMMENT_EDITED: "edited a comment",
  COMMENT_DELETED: "deleted a comment",
  ATTACHMENT_UPLOADED: "uploaded an attachment",
  ATTACHMENT_DELETED: "deleted an attachment",
  DEPENDENCY_ADDED: "added a dependency",
  DEPENDENCY_REMOVED: "removed a dependency",
  ARCHIVED: "archived the issue",
  RESTORED: "restored the issue",
  DUPLICATED: "duplicated the issue",
};
