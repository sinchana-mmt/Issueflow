import { AppError } from "@/lib/errors";
import type { Actor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { filterSchema, parseBody } from "@/lib/validators";

export async function listFilters(actor: Actor) {
  const filters = await prisma.savedFilter.findMany({
    where: { userId: actor.id },
    orderBy: { name: "asc" },
  });
  return filters.map((filter) => ({
    id: filter.id,
    name: filter.name,
    queryString: filter.queryString,
    createdAt: filter.createdAt.toISOString(),
  }));
}

export async function createFilter(actor: Actor, body: unknown) {
  const input = parseBody(filterSchema, body);
  const filter = await prisma.savedFilter.create({
    data: { userId: actor.id, name: input.name, queryString: input.queryString },
  });
  return { id: filter.id, name: filter.name, queryString: filter.queryString };
}

export async function deleteFilter(actor: Actor, filterId: string) {
  const filter = await prisma.savedFilter.findUnique({ where: { id: filterId } });
  if (!filter || filter.userId !== actor.id) throw new AppError(404, "NOT_FOUND", "Filter not found");
  await prisma.savedFilter.delete({ where: { id: filter.id } });
  return { deleted: true };
}
