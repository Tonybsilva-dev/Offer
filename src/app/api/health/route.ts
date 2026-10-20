import { connection, NextResponse } from "next/server";
import { getDb } from "@/shared/server/db";

export async function GET() {
  await connection();
  try {
    await (await getDb()).query("SELECT 1");
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[health] banco indisponível:", error instanceof Error ? error.message : error);
    return NextResponse.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
