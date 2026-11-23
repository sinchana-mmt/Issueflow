import { Prisma } from "@prisma/client";
import { createsBlockCycle } from "@/lib/dependencies";
import { AppError } from "@/lib/errors";
import { formatIssueKey } from "@/lib/keys";
import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { dependencySchema, parseBody } from "@/lib/validators";
import { assertCan, assertIssue, writeActivity } from "@/server/access";

export async function addDependency(actor: Actor, issueId: string, body: unknown) {
  assertCan(actor, "dependency.manage");
  const input = parseBody(dependencySchema, body);
  const origin = await assertIssue(actor, issueId);
  const related = await assertIssue(actor, input.relatedId);
  const type = input.type === "BLOCKED_BY" ? "BLOCKS" : input.type;
  const fromId = input.type === "BLOCKED_BY" ? related.id : origin.id;
  const toId = input.type === "BLOCKED_BY" ? origin.id : related.id;
  if (fromId === toId) throw new AppError(400, "VALIDATION_ERROR", "An issue cannot depend on itself");

  await prisma.$transaction(async (tx) => {
    if (type === "BLOCKS") {
      const edges = await tx.dependency.findMany({ where: { type: "BLOCKS" }, select: { issueId: true, relatedId: true } });
      if (createsBlockCycle(edges.map((edge) => ({ from: edge.issueId, to: edge.relatedId })), fromId, toId)) {
        throw new AppError(400, "VALIDATION_ERROR", "That link would create a circular block");
      }
    } else {
      const existing = await tx.dependency.findFirst({
        where: {
          type,
          OR: [
            { issueId: fromId, relatedId: toId },
            { issueId: toId, relatedId: fromId },
          ],
        },
      });
      if (existing) throw new AppError(409, "CONFLICT", "Those issues are already linked");
    }
    await tx.dependency.create({ data: { issueId: fromId, relatedId: toId, type, createdById: actor.id } });
    const label = `${input.type === "BLOCKED_BY" ? "Is blocked by" : type === "BLOCKS" ? "Blocks" : type === "RELATES" ? "Relates to" : "Duplicates"} ${formatIssueKey(related.project.key, related.number)}`;
    await writeActivity(tx, { issueId: origin.id, actorId: actor.id, action: "DEPENDENCY_ADDED", newValue: label });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  return { saved: true };
}

export async function removeDependency(actor: Actor, dependencyId: string) {
  assertCan(actor, "dependency.manage");
  const row = await prisma.dependency.findUnique({
    where: { id: dependencyId },
    include: {
      issue: { include: { project: { select: { key: true } } } },
      related: { include: { project: { select: { key: true } } } },
    },
  });
  if (!row) throw new AppError(404, "NOT_FOUND", "Dependency not found");
  await assertIssue(actor, row.issueId);
  await prisma.$transaction(async (tx) => {
    await tx.dependency.delete({ where: { id: row.id } });
    await writeActivity(tx, {
      issueId: row.issueId,
      actorId: actor.id,
      action: "DEPENDENCY_REMOVED",
      oldValue: formatIssueKey(row.related.project.key, row.related.number),
    });
  });
  return { deleted: true };
}
