import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { requireActor } from "@/lib/session";
import type { Actor } from "@/lib/permissions";

export function ok(data: unknown, message = "Operation completed successfully", status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function fail(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) return fail(error.code, error.message, error.status);
  if (error instanceof ZodError) {
    return fail("VALIDATION_ERROR", error.issues[0]?.message || "Invalid request", 400);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return fail("CONFLICT", "That value is already in use", 409);
  }
  console.error(error);
  return fail("INTERNAL_ERROR", "Something went wrong", 500);
}

export async function readJson(request: Request) {
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid JSON");
  }
}

export function queryRecord(request: Request) {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of new URL(request.url).searchParams.entries()) {
    const current = out[key];
    if (current === undefined) out[key] = value;
    else if (Array.isArray(current)) current.push(value);
    else out[key] = [current, value];
  }
  return out;
}

type Handler = (actor: Actor, request: Request, params: Record<string, string>) => Promise<unknown>;

export function api(handler: Handler) {
  return async (request: Request, context?: { params?: Promise<Record<string, string | string[]>> }) => {
    try {
      const actor = await requireActor();
      const raw = context?.params ? await context.params : {};
      const params: Record<string, string> = {};
      for (const [key, value] of Object.entries(raw)) {
        params[key] = Array.isArray(value) ? value.join("/") : value;
      }
      const result = await handler(actor, request, params);
      if (result instanceof Response) return result;
      return ok(result);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
