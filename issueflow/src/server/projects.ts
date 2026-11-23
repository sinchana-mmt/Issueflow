import { AppError } from "@/lib/errors";
import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { memberSchema, parseBody, projectCreateSchema, projectPatchSchema, tagCreateSchema, tagPatchSchema } from "@/lib/validators";
import { assertCan, assertProject, audit } from "@/server/access";

export async function listProjects(actor: Actor) {
  const projects = await prisma.project.findMany({
    where: actor.role === "SUPERADMIN" ? {} : { members: { some: { userId: actor.id } } },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { issues: true, members: true } },
    },
    orderBy: { name: "asc" },
  });
  return projects.map(serializeProject);
}

export async function getProject(actor: Actor, projectId: string) {
  await assertProject(actor, projectId);
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      createdBy: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true, active: true } } }, orderBy: { createdAt: "asc" } },
      tags: { orderBy: { name: "asc" } },
      _count: { select: { issues: true } },
    },
  });
  return {
    ...serializeProject(project),
    members: project.members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.user.role,
      active: member.user.active,
    })),
    tags: project.tags.map(serializeTag),
  };
}

export async function createProject(actor: Actor, body: unknown) {
  assertCan(actor, "project.create");
  const input = parseBody(projectCreateSchema, body);
  const project = await prisma.project.create({
    data: {
      name: input.name,
      key: input.key,
      description: input.description || null,
      createdById: actor.id,
      members: { create: { userId: actor.id } },
    },
    include: { createdBy: { select: { id: true, name: true } }, _count: { select: { issues: true, members: true } } },
  });
  await audit(actor.id, "project.create", "project", project.id, project.key);
  return serializeProject(project);
}

export async function updateProject(actor: Actor, projectId: string, body: unknown) {
  assertCan(actor, "project.update");
  const existing = await assertProject(actor, projectId);
  const input = parseBody(projectPatchSchema, body);
  if (input.key && input.key !== existing.key) {
    const issues = await prisma.issue.count({ where: { projectId } });
    if (issues > 0) {
      throw new AppError(400, "VALIDATION_ERROR", "The project key cannot change after issues exist");
    }
  }
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      key: input.key,
      description: input.description,
      status: input.status,
      archivedAt: input.status === "ARCHIVED" ? new Date() : input.status === "ACTIVE" ? null : undefined,
    },
    include: { createdBy: { select: { id: true, name: true } }, _count: { select: { issues: true, members: true } } },
  });
  return serializeProject(project);
}

export async function addMember(actor: Actor, projectId: string, body: unknown) {
  assertCan(actor, "project.member.manage");
  await assertProject(actor, projectId);
  const input = parseBody(memberSchema, body);
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user?.active) throw new AppError(400, "VALIDATION_ERROR", "That user cannot be added");
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: user.id } },
    update: {},
    create: { projectId, userId: user.id },
  });
  return getProject(actor, projectId);
}

export async function removeMember(actor: Actor, projectId: string, userId: string) {
  assertCan(actor, "project.member.manage");
  await assertProject(actor, projectId);
  await prisma.projectMember.deleteMany({ where: { projectId, userId } });
  return { removed: true };
}

export async function listTags(actor: Actor, projectId?: string) {
  return prisma.tag.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(actor.role === "SUPERADMIN" ? {} : { project: { members: { some: { userId: actor.id } } } }),
    },
    include: { project: { select: { id: true, key: true, name: true } } },
    orderBy: [{ project: { name: "asc" } }, { name: "asc" }],
  }).then((tags) => tags.map((tag) => ({ ...serializeTag(tag), project: tag.project })));
}

export async function createTag(actor: Actor, projectId: string, body: unknown) {
  assertCan(actor, "tag.manage");
  await assertProject(actor, projectId, true);
  const input = parseBody(tagCreateSchema, body);
  const tag = await prisma.tag.create({ data: { projectId, name: input.name, color: input.color } });
  return serializeTag(tag);
}

export async function updateTag(actor: Actor, tagId: string, body: unknown) {
  assertCan(actor, "tag.manage");
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) throw new AppError(404, "NOT_FOUND", "Tag not found");
  await assertProject(actor, tag.projectId, true);
  const input = parseBody(tagPatchSchema, body);
  const updated = await prisma.tag.update({
    where: { id: tag.id },
    data: { name: input.name, color: input.color },
  });
  return serializeTag(updated);
}

export async function deleteTag(actor: Actor, tagId: string) {
  assertCan(actor, "tag.manage");
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) throw new AppError(404, "NOT_FOUND", "Tag not found");
  await assertProject(actor, tag.projectId, true);
  await prisma.tag.delete({ where: { id: tag.id } });
  return { deleted: true };
}

function serializeTag(tag: { id: string; name: string; color: string }) {
  return { id: tag.id, name: tag.name, color: tag.color };
}

function serializeProject(project: {
  id: string;
  name: string;
  key: string;
  description: string | null;
  status: string;
  createdAt: Date;
  createdBy: { id: string; name: string };
  _count: { issues: number; members?: number };
}) {
  return {
    id: project.id,
    name: project.name,
    key: project.key,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    createdBy: project.createdBy,
    issueCount: project._count.issues,
    memberCount: project._count.members ?? 0,
  };
}
