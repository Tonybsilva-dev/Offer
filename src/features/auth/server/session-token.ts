import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "bazar_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(secret: string, now = Date.now()): string {
  const expiresAt = String(now + SESSION_TTL_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token || !secret) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < now) return false;
  return safeEqual(signature, sign(expiresAt, secret));
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
