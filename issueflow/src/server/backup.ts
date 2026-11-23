import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { runtimeEnv } from "@/lib/env";

const exec = promisify(execFile);

export async function runBackup() {
  const directory = runtimeEnv.backupDir();
  await fs.mkdir(directory, { recursive: true });
  await fs.mkdir(runtimeEnv.attachmentDir(), { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const sqlPath = path.join(directory, `issueflow-${stamp}.sql`);
  const archivePath = path.join(directory, `attachments-${stamp}.tar.gz`);
  await exec("pg_dump", ["--clean", "--if-exists", "--no-owner", "--dbname", runtimeEnv.databaseUrl(), "--file", sqlPath]);
  await exec("tar", ["-czf", archivePath, "-C", runtimeEnv.attachmentDir(), "."]);
  await prune(directory, /^issueflow-.*\.sql$/);
  await prune(directory, /^attachments-.*\.tar\.gz$/);
  return { sqlPath, archivePath };
}

async function prune(directory: string, pattern: RegExp) {
  const names = (await fs.readdir(directory)).filter((name) => pattern.test(name)).sort();
  const extra = names.slice(0, Math.max(0, names.length - 7));
  await Promise.all(extra.map((name) => fs.unlink(path.join(directory, name))));
}
