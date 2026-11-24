import type { Prisma } from "@prisma/client";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { can, type Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const membership = (actor: Actor) => ({ where: { userId: actor.id }, select: { userId: true, delegated: true } });

export async function assertCompany(actor: Actor, companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { members: membership(actor) },
  });
  if (!company || (actor.role !== "SUPERADMIN" && company.members.length === 0)) throw notFound("Company not found");
  return company;
}

export async function assertCompanyAdmin(actor: Actor, companyId: string) {
  const company = await assertCompany(actor, companyId);
  const delegated = company.members.some((member) => member.delegated);
  if (actor.role === "SUPERADMIN" || actor.role === "ADMIN" || delegated) return company;
  throw forbidden();
}

export async function assertIssue(actor: Actor, issueId: string) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      company: { include: { members: membership(actor) } },
      assignee: { select: { id: true, name: true } },
      tags: { select: { tagId: true, tag: { select: { id: true, name: true, color: true } } } },
    },
  });
  if (!issue || (actor.role !== "SUPERADMIN" && issue.company.members.length === 0)) throw notFound("Issue not found");
  return issue;
}

export function assertCan(actor: Actor, action: Parameters<typeof can>[1]) {
  if (!can(actor, action)) throw forbidden();
}

export async function assertAssignee(companyId: string, assigneeId: string | null | undefined) {
  if (!assigneeId) return;
  const member = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId: assigneeId } },
    include: { user: { select: { active: true, name: true } } },
  });
  if (!member?.user.active) {
    throw new AppError(400, "VALIDATION_ERROR", "Assignee must be an active member of this company");
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
