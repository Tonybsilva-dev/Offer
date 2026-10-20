import "server-only";
import { headers } from "next/headers";
import { env } from "./env";

/** URL pública do site: NEXT_PUBLIC_SITE_URL ou host da requisição. */
export async function getBaseUrl(): Promise<string> {
  const configured = env.siteUrl();
  if (configured) return configured;
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const proto = list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
