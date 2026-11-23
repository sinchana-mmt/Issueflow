import { PgBoss } from "pg-boss";
import { runtimeEnv } from "@/lib/env";
import { runBackup } from "@/server/backup";
import { prisma } from "@/lib/prisma";
import { runDueReminders } from "@/server/reminders";

async function main() {
  const boss = new PgBoss({ connectionString: runtimeEnv.databaseUrl(), schema: "pgboss" });
  boss.on("error", (error) => console.error(error));
  await boss.start();
  await boss.createQueue("due-reminders");
  await boss.createQueue("daily-backup");
  await boss.schedule("due-reminders", runtimeEnv.reminderCron(), {}, { tz: "UTC" });
  await boss.schedule("daily-backup", runtimeEnv.backupCron(), {}, { tz: "UTC" });
  await boss.work("due-reminders", async () => {
    const result = await runDueReminders();
    console.log("Due reminders", result);
  });
  await boss.work("daily-backup", async () => {
    const result = await runBackup();
    console.log("Backup written", result.sqlPath);
  });
  console.log("IssueFlow worker started");
  const shutdown = async () => {
    await boss.stop();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
