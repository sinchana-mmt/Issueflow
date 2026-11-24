import fs from "node:fs/promises";
import path from "node:path";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { assertSafeFile } from "@/lib/files";
import { runtimeEnv } from "@/lib/env";
import { formatIssueKey } from "@/lib/keys";
import { can, type Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { assertCan, assertIssue, writeActivity } from "@/server/access";

function rootDir() {
  return path.resolve(runtimeEnv.attachmentDir());
}

export function storedPath(storedName: string) {
  const full = path.resolve(rootDir(), storedName);
  const relative = path.relative(rootDir(), full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid file path");
  }
  return full;
}

export async function saveAttachment(actor: Actor, issueId: string, file: File) {
  assertCan(actor, "attachment.upload");
  const issue = await assertIssue(actor, issueId);
  if (issue.archivedAt) {
    throw new AppError(400, "VALIDATION_ERROR", "Archived issues do not accept files");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const safe = assertSafeFile(file.name, file.type || "application/octet-stream", bytes);
  const storedName = `${crypto.randomUUID()}.${safe.extension}`;
  await fs.mkdir(rootDir(), { recursive: true });
  await fs.writeFile(storedPath(storedName), bytes);
  try {
    await prisma.$transaction(async (tx) => {
      await tx.attachment.create({
        data: {
          issueId: issue.id,
          fileName: safe.fileName,
          storedName,
          mimeType: file.type,
          sizeBytes: bytes.byteLength,
          uploadedById: actor.id,
        },
      });
      await writeActivity(tx, {
        issueId: issue.id,
        actorId: actor.id,
        action: "ATTACHMENT_UPLOADED",
        newValue: safe.fileName,
      });
    });
  } catch (error) {
    await fs.unlink(storedPath(storedName)).catch(() => undefined);
    throw error;
  }
  return { saved: true, key: formatIssueKey(issue.company.key, issue.number) };
}

export async function readAttachment(actor: Actor, attachmentId: string) {
  const file = await prisma.attachment.findUnique({ where: { id: attachmentId } });
  if (!file) throw notFound("Attachment not found");
  await assertIssue(actor, file.issueId);
  const bytes = await fs.readFile(storedPath(file.storedName));
  return { file, bytes };
}

export async function deleteAttachment(actor: Actor, attachmentId: string) {
  const file = await prisma.attachment.findUnique({ where: { id: attachmentId } });
  if (!file) throw notFound("Attachment not found");
  await assertIssue(actor, file.issueId);
  if (file.uploadedById !== actor.id && !can(actor, "issue.delete")) throw forbidden();
  await prisma.$transaction(async (tx) => {
    await tx.attachment.delete({ where: { id: file.id } });
    await writeActivity(tx, {
      issueId: file.issueId,
      actorId: actor.id,
      action: "ATTACHMENT_DELETED",
      oldValue: file.fileName,
    });
  });
  await fs.unlink(storedPath(file.storedName)).catch(() => undefined);
  return { deleted: true };
}

export async function removeStoredFiles(storedNames: string[]) {
  await Promise.all(storedNames.map((name) => fs.unlink(storedPath(name)).catch(() => undefined)));
}
