import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}

export async function send<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const response = await fetch(url, { ...init, headers });
  const type = response.headers.get("content-type") || "";
  const payload = type.includes("json") ? await response.json() : null;
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error?.message || "Request failed");
  }
  return payload?.data as T;
}
