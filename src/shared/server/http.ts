import "server-only";
import { NextResponse } from "next/server";
import { isAdmin } from "@/features/auth/server/session";

export function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

/** Retorna resposta 401 quando não há sessão de admin; null quando autorizado. */
export async function guardAdmin() {
  return (await isAdmin()) ? null : jsonError(401, "Não autorizado");
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
