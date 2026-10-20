import { NextResponse, type NextRequest } from "next/server";
import { parseItemInput } from "@/features/items/domain/item-schema";
import { itemRepository } from "@/features/items/server/container";
import { guardAdmin, jsonError, readJson } from "@/shared/server/http";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  const items = await itemRepository().list({ query });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const parsed = parseItemInput(await readJson(request));
  if (!parsed.ok) return jsonError(422, "Dados inválidos", parsed.errors);

  const item = await itemRepository().create(parsed.value);
  return NextResponse.json({ item }, { status: 201 });
}
