import type { NotificationType, Prisma } from "@prisma/client";

export async function notify(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    type: NotificationType;
    issueId?: string;
    title: string;
    body: string;
    dedupKey?: string;
  },
) {
  if (input.dedupKey) {
    await tx.notification.upsert({
      where: { dedupKey: input.dedupKey },
      update: {},
      create: input,
    });
    return;
  }
  await tx.notification.create({ data: input });
}

export function mentionedNames(text: string) {
  const names = new Set<string>();
  for (const match of text.matchAll(/(^|[\s(])@([A-Za-z][\w.'-]{0,78})/g)) {
    names.add(match[2].toLowerCase());
  }
  return names;
}
