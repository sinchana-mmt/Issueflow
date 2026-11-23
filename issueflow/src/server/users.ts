import { hashPassword } from "better-auth/crypto";
import { headers } from "next/headers";
import { ROLES, type Role } from "@/lib/constants";
import { AppError, forbidden } from "@/lib/errors";
import { can, type Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { passwordChangeSchema, userCreateSchema, userPatchSchema, parseBody } from "@/lib/validators";
import { assertCan, audit } from "@/server/access";

const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
} as const;

export async function listPeople(actor: Actor) {
  if (actor.role !== "USER") return listUsers(actor);
  const rows = await prisma.projectMember.findMany({
    where: { project: { members: { some: { userId: actor.id } } } },
    include: { user: { select: publicUser } },
  });
  const seen = new Map<string, (typeof rows)[number]["user"]>();
  for (const row of rows) seen.set(row.user.id, row.user);
  return [...seen.values()].map(serializeUser).sort((a, b) => a.name.localeCompare(b.name));
}

export async function listUsers(actor: Actor) {
  if (actor.role === "USER") throw forbidden();
  const users = await prisma.user.findMany({
    select: publicUser,
    orderBy: { name: "asc" },
  });
  return users.map(serializeUser);
}

export async function provisionUser(input: { name: string; email: string; password: string; role: Role }) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, "CONFLICT", "A user with that email already exists");
  const id = crypto.randomUUID();
  const password = await hashPassword(input.password);
  const now = new Date();
  const user = await prisma.user.create({
    data: {
      id,
      name: input.name,
      email,
      emailVerified: true,
      role: input.role,
      active: true,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: id,
          providerId: "credential",
          password,
          createdAt: now,
          updatedAt: now,
        },
      },
    },
    select: publicUser,
  });
  return serializeUser(user);
}

export async function createUser(actor: Actor, body: unknown) {
  assertCan(actor, "user.create");
  const input = parseBody(userCreateSchema, body);
  if (actor.role !== "SUPERADMIN" && input.role !== "USER") {
    throw new AppError(403, "FORBIDDEN", "Only a superadmin can assign Admin or Superadmin");
  }
  const user = await provisionUser(input);
  await audit(actor.id, "user.create", "user", user.id, user.email);
  return user;
}

export async function updateUser(actor: Actor, userId: string, body: unknown) {
  const input = parseBody(userPatchSchema, body);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found");
  const self = actor.id === user.id;
  if (!self) assertCan(actor, "user.update");
  if (self && (input.role || input.active === false)) {
    throw new AppError(400, "VALIDATION_ERROR", "You cannot change your own role or deactivate yourself");
  }
  if (input.role && input.role !== user.role && !can(actor, "user.update")) throw forbidden();
  if ((input.role === "SUPERADMIN" || user.role === "SUPERADMIN") && actor.role !== "SUPERADMIN") {
    throw forbidden();
  }
  if (input.active === false && user.role === "SUPERADMIN") {
    const others = await prisma.user.count({ where: { role: "SUPERADMIN", active: true, NOT: { id: user.id } } });
    if (others === 0) throw new AppError(400, "VALIDATION_ERROR", "At least one active superadmin is required");
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: input.name,
      role: input.role,
      active: input.active,
    },
    select: publicUser,
  });
  if (!self) {
    await audit(actor.id, input.active === false ? "user.deactivate" : "user.update", "user", user.id, updated.email);
  }
  return serializeUser(updated);
}

export async function changeOwnPassword(actor: Actor, body: unknown) {
  const input = parseBody(passwordChangeSchema, body);
  try {
    await auth.api.changePassword({
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not change the password";
    throw new AppError(400, "VALIDATION_ERROR", message);
  }
  return { changed: true };
}

function serializeUser(user: { id: string; name: string; email: string; role: string; active: boolean; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: ROLES.includes(user.role as Role) ? (user.role as Role) : "USER",
    active: user.active,
    createdAt: user.createdAt.toISOString(),
  };
}
