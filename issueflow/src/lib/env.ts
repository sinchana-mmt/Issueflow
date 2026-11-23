const env = process.env;

function required(name: string) {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

export const runtimeEnv = {
  databaseUrl: () => required("DATABASE_URL"),
  authSecret: () => required("BETTER_AUTH_SECRET"),
  authUrl: () => env.BETTER_AUTH_URL || "http://localhost:3000",
  attachmentDir: () => env.ATTACHMENT_DIR || `${process.cwd()}/data/attachments`,
  backupDir: () => env.BACKUP_DIR || `${process.cwd()}/data/backups`,
  reminderCron: () => env.REMINDER_CRON || "*/15 * * * *",
  backupCron: () => env.BACKUP_CRON || "15 2 * * *",
};
