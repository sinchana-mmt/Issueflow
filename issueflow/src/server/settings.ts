import { AppError } from "@/lib/errors";
import { can, type Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { isValidTimeZone } from "@/lib/reminders";
import { parseBody, settingsSchema } from "@/lib/validators";
import { assertCan, audit } from "@/server/access";

export async function getSettings() {
  return prisma.appSetting.upsert({
    where: { id: "app" },
    update: {},
    create: { id: "app" },
  });
}

export async function updateSettings(actor: Actor, body: unknown) {
  assertCan(actor, "settings.update");
  const input = parseBody(settingsSchema, body);
  if (!isValidTimeZone(input.timezone)) {
    throw new AppError(400, "VALIDATION_ERROR", "Choose a valid IANA timezone, such as UTC or Asia/Kolkata");
  }
  const settings = await prisma.appSetting.upsert({
    where: { id: "app" },
    update: input,
    create: { id: "app", ...input },
  });
  await audit(actor.id, "settings.update", "settings", "app", input.timezone);
  return {
    organizationName: settings.organizationName,
    timezone: settings.timezone,
    canEdit: can(actor, "settings.update"),
  };
}

export async function settingsView(actor: Actor) {
  const settings = await getSettings();
  return {
    organizationName: settings.organizationName,
    timezone: settings.timezone,
    canEdit: can(actor, "settings.update"),
  };
}
