import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/server/http";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: "ok" });
  } catch {
    return fail("UNAVAILABLE", "Database is not ready", 503);
  }
}
