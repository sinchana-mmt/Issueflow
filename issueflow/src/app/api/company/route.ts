import { NextResponse } from "next/server";
import { COMPANY_COOKIE } from "@/lib/company";
import { requireActor } from "@/lib/session";
import { assertCompany } from "@/server/access";
import { errorResponse, readJson } from "@/server/http";

export async function POST(request: Request) {
  try {
    const actor = await requireActor();
    const body = await readJson(request);
    const id = typeof body === "object" && body && "id" in body && typeof body.id === "string" ? body.id : "";
    await assertCompany(actor, id);
    const response = NextResponse.json({ success: true, data: { id }, message: "Company selected" });
    response.cookies.set(COMPANY_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
