import { cookies } from "next/headers";
import { COMPANY_COOKIE } from "@/lib/company";
import { AppError, forbidden } from "@/lib/errors";
import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { companyCreateSchema, companyPatchSchema, memberSchema, parseBody, tagCreateSchema, tagPatchSchema } from "@/lib/validators";
import { assertCan, assertCompany, assertCompanyAdmin, audit } from "@/server/access";

const companyInclude = {
  _count: { select: { issues: true, members: true } },
} as const;

export async function listCompanies(actor: Actor) {
  const companies = await prisma.company.findMany({
    where: actor.role === "SUPERADMIN" ? {} : { members: { some: { userId: actor.id } } },
    include: {
      ...companyInclude,
      members: { where: { userId: actor.id }, select: { delegated: true } },
    },
    orderBy: { name: "asc" },
  });
  return companies.map((company) => ({
    ...serializeCompany(company),
    delegated: actor.role === "SUPERADMIN" || actor.role === "ADMIN" || company.members.some((member) => member.delegated),
  }));
}

export async function companyContext(actor: Actor) {
  const companies = await listCompanies(actor);
  const selected = (await cookies()).get(COMPANY_COOKIE)?.value;
  const current = companies.find((company) => company.id === selected) || companies[0] || null;
  return { companies, companyId: current?.id || "" };
}

export async function getCompany(actor: Actor, companyId: string) {
  await assertCompany(actor, companyId);
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true, active: true } } },
        orderBy: { createdAt: "asc" },
      },
      tags: { orderBy: { name: "asc" } },
      _count: { select: { issues: true, members: true } },
    },
  });
  return {
    ...serializeCompany(company),
    members: company.members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.user.role,
      active: member.user.active,
      delegated: member.delegated,
    })),
    tags: company.tags.map(serializeTag),
  };
}

export async function createCompany(actor: Actor, body: unknown) {
  assertCan(actor, "company.create");
  const input = parseBody(companyCreateSchema, body);
  const company = await prisma.company.create({
    data: {
      name: input.name,
      key: input.key,
      createdById: actor.id,
      members: { create: { userId: actor.id, delegated: true } },
    },
    include: companyInclude,
  });
  await audit(actor.id, "company.create", "company", company.id, company.key);
  return serializeCompany(company);
}

export async function updateCompany(actor: Actor, companyId: string, body: unknown) {
  assertCan(actor, "company.create");
  const existing = await assertCompany(actor, companyId);
  const input = parseBody(companyPatchSchema, body);
  if (input.key && input.key !== existing.key) {
    const issues = await prisma.issue.count({ where: { companyId } });
    if (issues > 0) throw new AppError(400, "VALIDATION_ERROR", "The company code cannot change after issues exist");
  }
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { name: input.name, key: input.key },
    include: companyInclude,
  });
  return serializeCompany(company);
}

export async function addMember(actor: Actor, companyId: string, body: unknown) {
  const input = parseBody(memberSchema, body);
  if (input.delegated && actor.role !== "SUPERADMIN") throw forbidden();
  if (actor.role !== "SUPERADMIN") await assertCompanyAdmin(actor, companyId);
  else await assertCompany(actor, companyId);
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user?.active) throw new AppError(400, "VALIDATION_ERROR", "That user cannot be added");
  await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId, userId: user.id } },
    update: { delegated: input.delegated ?? undefined },
    create: { companyId, userId: user.id, delegated: input.delegated === true },
  });
  await audit(actor.id, "company.member", "company", companyId, user.email);
  return getCompany(actor, companyId);
}

export async function removeMember(actor: Actor, companyId: string, userId: string) {
  if (actor.role !== "SUPERADMIN") await assertCompanyAdmin(actor, companyId);
  else await assertCompany(actor, companyId);
  await prisma.companyMember.deleteMany({ where: { companyId, userId } });
  await audit(actor.id, "company.member.remove", "company", companyId, userId);
  return { removed: true };
}

export async function listTags(actor: Actor, companyId?: string) {
  return prisma.tag.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      ...(actor.role === "SUPERADMIN" ? {} : { company: { members: { some: { userId: actor.id } } } }),
    },
    include: { company: { select: { id: true, key: true, name: true } } },
    orderBy: [{ company: { name: "asc" } }, { name: "asc" }],
  }).then((tags) => tags.map((tag) => ({ ...serializeTag(tag), company: tag.company })));
}

export async function createTag(actor: Actor, companyId: string, body: unknown) {
  await assertCompanyAdmin(actor, companyId);
  const input = parseBody(tagCreateSchema, body);
  const tag = await prisma.tag.create({ data: { companyId, name: input.name, color: input.color } });
  return serializeTag(tag);
}

export async function updateTag(actor: Actor, tagId: string, body: unknown) {
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) throw new AppError(404, "NOT_FOUND", "Tag not found");
  await assertCompanyAdmin(actor, tag.companyId);
  const input = parseBody(tagPatchSchema, body);
  const updated = await prisma.tag.update({
    where: { id: tag.id },
    data: { name: input.name, color: input.color },
  });
  return serializeTag(updated);
}

export async function deleteTag(actor: Actor, tagId: string) {
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) throw new AppError(404, "NOT_FOUND", "Tag not found");
  await assertCompanyAdmin(actor, tag.companyId);
  await prisma.tag.delete({ where: { id: tag.id } });
  return { deleted: true };
}

function serializeTag(tag: { id: string; name: string; color: string }) {
  return { id: tag.id, name: tag.name, color: tag.color };
}

function serializeCompany(company: {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  _count: { issues: number; members?: number };
}) {
  return {
    id: company.id,
    name: company.name,
    key: company.key,
    createdAt: company.createdAt.toISOString(),
    issueCount: company._count.issues,
    memberCount: company._count.members ?? 0,
  };
}
