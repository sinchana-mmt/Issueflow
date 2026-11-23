import { z } from "zod";
import { ISSUE_STATUSES, ISSUE_TYPES, LINK_TYPES, PRIORITIES, ROLES, TAG_COLORS } from "@/lib/constants";
import { AppError } from "@/lib/errors";

const due = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const passwordSchema = z.string().min(8).max(128);

export const userCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  password: passwordSchema,
  role: z.enum(ROLES).default("USER"),
});

export const userPatchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  key: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z][A-Z0-9]{1,9}$/, "Use 2–10 letters or numbers, starting with a letter"),
  description: z.string().trim().max(5000).optional().nullable(),
});

export const projectPatchSchema = projectCreateSchema.partial().extend({
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export const memberSchema = z.object({ userId: z.string().min(1) });

export const tagCreateSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.enum(TAG_COLORS).default(TAG_COLORS[0]),
});

export const tagPatchSchema = tagCreateSchema.partial();

export const issueCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(100_000).optional().nullable(),
  projectId: z.string().min(1),
  type: z.enum(ISSUE_TYPES),
  status: z.enum(ISSUE_STATUSES).default("BACKLOG"),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  assigneeId: z.string().min(1).nullable().optional(),
  tagIds: z.array(z.string()).max(20).optional(),
  dueDate: due.nullable().optional(),
  parentId: z.string().min(1).nullable().optional(),
});

export const issuePatchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(100_000).nullable().optional(),
  type: z.enum(ISSUE_TYPES).optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  tagIds: z.array(z.string()).max(20).optional(),
  dueDate: due.nullable().optional(),
  archived: z.boolean().optional(),
  updatedAt: z.string().min(10).max(40).optional(),
  overIssueId: z.string().optional(),
  place: z.enum(["before", "after"]).optional(),
});

export const bulkSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  status: z.enum(ISSUE_STATUSES).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  addTagId: z.string().optional(),
  removeTagId: z.string().optional(),
  archive: z.boolean().optional(),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1).max(20_000),
});

export const dependencySchema = z.object({
  relatedId: z.string().min(1),
  type: z.enum(LINK_TYPES),
});

export const filterSchema = z.object({
  name: z.string().trim().min(1).max(80),
  queryString: z.string().max(2000),
});

export const settingsSchema = z.object({
  organizationName: z.string().trim().min(1).max(80),
  timezone: z.string().trim().min(1).max(80),
});

export function parseBody<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", result.error.issues[0]?.message || "Invalid request");
  }
  return result.data;
}
