import { workEmail } from "../src/lib/email";
import { prisma } from "../src/lib/prisma";
import { provisionUser } from "../src/server/users";

async function main() {
  await prisma.appSetting.upsert({
    where: { id: "app" },
    update: {},
    create: { id: "app", organizationName: "IssueFlow", timezone: "UTC" },
  });
  const email = workEmail(process.env.ADMIN_EMAIL || "");
  if (!email) {
    console.error("Set ADMIN_EMAIL to a real company address. Addresses on issueflow.local are not accepted.");
    process.exit(1);
  }
  const legacy = await prisma.user.findUnique({ where: { email: "admin@issueflow.local" } });
  if (legacy) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (!taken) await prisma.user.update({ where: { id: legacy.id }, data: { email } });
  }
  const supers = await prisma.user.count({ where: { role: "SUPERADMIN", active: true } });
  if (supers > 0) {
    console.log("Active superadmin already exists");
    return;
  }
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Superadmin";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Account ${email} already exists`);
    return;
  }
  if (!password) {
    console.error("Set ADMIN_PASSWORD before the first startup");
    process.exit(1);
  }
  await provisionUser({ name, email, password, role: "SUPERADMIN" });
  console.log(`Created superadmin ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
