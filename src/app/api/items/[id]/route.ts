import { NextResponse } from "next/server";
import { parseItemInput } from "@/features/items/domain/item-schema";
import { itemRepository } from "@/features/items/server/container";
import { guardAdmin, jsonError, readJson } from "@/shared/server/http";

export async function GET(_request: Request, ctx: RouteContext<"/api/items/[id]">) {
  const { id } = await ctx.params;
  const item = await itemRepository().findById(id);
  return item ? NextResponse.json({ item }) : jsonError(404, "Item não encontrado");
}

export async function PUT(request: Request, ctx: RouteContext<"/api/items/[id]">) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const parsed = parseItemInput(await readJson(request));
  if (!parsed.ok) return jsonError(422, "Dados inválidos", parsed.errors);

  const { id } = await ctx.params;
  const item = await itemRepository().update(id, parsed.value);
  return item ? NextResponse.json({ item }) : jsonError(404, "Item não encontrado");
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/items/[id]">) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const removed = await itemRepository().remove(id);
  return removed ? new NextResponse(null, { status: 204 }) : jsonError(404, "Item não encontrado");
}
