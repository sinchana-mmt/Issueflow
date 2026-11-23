import { formatIssueKey } from "@/lib/keys";
import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { commentSchema, parseBody } from "@/lib/validators";
import { assertCan, assertIssue, writeActivity } from "@/server/access";
import { mentionedNames, notify } from "@/server/notifications";
import { AppError, forbidden } from "@/lib/errors";

export async function addComment(actor: Actor, issueId: string, body: unknown) {
  assertCan(actor, "comment.create");
  const issue = await assertIssue(actor, issueId);
  if (issue.archivedAt || issue.project.status === "ARCHIVED") {
    throw new AppError(400, "VALIDATION_ERROR", "Comments are closed on archived work");
  }
  const input = parseBody(commentSchema, body);
  const members = await prisma.projectMember.findMany({
    where: { projectId: issue.projectId },
    include: { user: { select: { id: true, name: true } } },
  });
  const names = mentionedNames(input.body);
  const key = formatIssueKey(issue.project.key, issue.number);
  await prisma.$transaction(async (tx) => {
    await tx.comment.create({ data: { issueId: issue.id, authorId: actor.id, body: input.body } });
    await writeActivity(tx, { issueId: issue.id, actorId: actor.id, action: "COMMENT_ADDED", newValue: input.body });
    const commentRecipients = new Set<string>();
    if (issue.assigneeId && issue.assigneeId !== actor.id) commentRecipients.add(issue.assigneeId);
    if (issue.reporterId !== actor.id) commentRecipients.add(issue.reporterId);
    for (const userId of commentRecipients) {
      await notify(tx, {
        userId,
        type: "COMMENT",
        issueId: issue.id,
        title: `${actor.name} commented on ${key}`,
        body: input.body,
      });
    }
    for (const member of members) {
      if (!names.has(member.user.name.toLowerCase())) continue;
      if (member.user.id === actor.id || commentRecipients.has(member.user.id)) continue;
      await notify(tx, {
        userId: member.user.id,
        type: "MENTION",
        issueId: issue.id,
        title: `${actor.name} mentioned you on ${key}`,
        body: input.body,
      });
    }
  });
  return { saved: true };
}

export async function updateComment(actor: Actor, commentId: string, body: unknown) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(404, "NOT_FOUND", "Comment not found");
  await assertIssue(actor, comment.issueId);
  if (comment.authorId !== actor.id && actor.role !== "SUPERADMIN") throw forbidden();
  const input = parseBody(commentSchema, body);
  await prisma.$transaction(async (tx) => {
    await tx.comment.update({ where: { id: comment.id }, data: { body: input.body } });
    await writeActivity(tx, { issueId: comment.issueId, actorId: actor.id, action: "COMMENT_EDITED" });
  });
  return { saved: true };
}

export async function deleteComment(actor: Actor, commentId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(404, "NOT_FOUND", "Comment not found");
  await assertIssue(actor, comment.issueId);
  if (comment.authorId !== actor.id && actor.role !== "SUPERADMIN") throw forbidden();
  await prisma.$transaction(async (tx) => {
    await tx.comment.delete({ where: { id: comment.id } });
    await writeActivity(tx, { issueId: comment.issueId, actorId: actor.id, action: "COMMENT_DELETED" });
  });
  return { deleted: true };
}
