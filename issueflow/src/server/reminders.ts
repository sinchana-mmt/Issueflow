import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatIssueKey } from "@/lib/keys";
import { classifyDue, reminderDedupKey } from "@/lib/reminders";
import { getSettings } from "@/server/settings";

export async function listNotifications(actor: Actor) {
  const [items, unread] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId: actor.id },
      include: { issue: { select: { id: true, number: true, company: { select: { key: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { userId: actor.id, readAt: null } }),
  ]);
  return {
    unread,
    notifications: items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      body: item.body,
      readAt: item.readAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      issue: item.issue
        ? { id: item.issue.id, key: formatIssueKey(item.issue.company.key, item.issue.number) }
        : null,
    })),
  };
}

export async function markRead(actor: Actor, body: { id?: string; all?: boolean }) {
  if (body.all) {
    await prisma.notification.updateMany({ where: { userId: actor.id, readAt: null }, data: { readAt: new Date() } });
    return { updated: true };
  }
  if (!body.id) return { updated: false };
  await prisma.notification.updateMany({ where: { id: body.id, userId: actor.id }, data: { readAt: new Date() } });
  return { updated: true };
}

export async function runDueReminders() {
  const settings = await getSettings();
  const issues = await prisma.issue.findMany({
    where: {
      dueDate: { not: null },
      archivedAt: null,
      status: { not: "DONE" },
    },
    select: {
      id: true,
      number: true,
      title: true,
      dueDate: true,
      assigneeId: true,
      reporterId: true,
      company: { select: { key: true } },
    },
  });
  let sent = 0;
  for (const issue of issues) {
    const due = issue.dueDate!.toISOString().slice(0, 10);
    const kind = classifyDue(due, settings.timezone);
    if (kind === "later") continue;
    const type = kind === "today" ? "DUE_TODAY" : kind === "tomorrow" ? "DUE_TOMORROW" : "OVERDUE";
    const label = kind === "today" ? "due today" : kind === "tomorrow" ? "due tomorrow" : "overdue";
    const recipients = [...new Set([issue.assigneeId, issue.reporterId].filter((id): id is string => Boolean(id)))];
    for (const userId of recipients) {
      const dedupKey = reminderDedupKey(userId, issue.id, kind, due);
      const existing = await prisma.notification.findUnique({ where: { dedupKey } });
      if (existing) continue;
      await prisma.notification.create({
        data: {
          userId,
          type,
          issueId: issue.id,
          dedupKey,
          title: `${formatIssueKey(issue.company.key, issue.number)} is ${label}`,
          body: issue.title,
        },
      });
      sent += 1;
    }
  }
  return { scanned: issues.length, sent };
}
