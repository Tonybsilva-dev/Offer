import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/shared/server/env";
import {
  createSessionToken,
  safeEqual,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  verifySessionToken,
} from "./session-token";

export function checkPassword(password: unknown): boolean {
  const expected = env.adminPassword();
  return typeof password === "string" && expected.length > 0 && safeEqual(password, expected);
}

export async function startSession() {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(env.sessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, env.sessionSecret());
}

/** Para páginas do painel: redireciona ao login sem sessão válida. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
