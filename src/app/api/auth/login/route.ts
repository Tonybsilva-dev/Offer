import { NextResponse } from "next/server";
import { checkPassword, startSession } from "@/features/auth/server/session";
import { jsonError, readJson } from "@/shared/server/http";

export async function POST(request: Request) {
  const body = (await readJson(request)) as { password?: unknown } | undefined;
  if (!checkPassword(body?.password)) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return jsonError(401, "Senha incorreta");
  }
  await startSession();
  return NextResponse.json({ ok: true });
}
