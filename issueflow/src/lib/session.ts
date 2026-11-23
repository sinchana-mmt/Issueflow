import { headers } from "next/headers";
import { ROLES, type Role } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function getActor(): Promise<Actor | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user?.active || !ROLES.includes(user.role as Role)) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    active: true,
  };
}

export async function requireActor() {
  const actor = await getActor();
  if (!actor) throw new AppError(401, "UNAUTHORIZED", "Sign in required");
  return actor;
}
