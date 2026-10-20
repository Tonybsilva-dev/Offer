import { NextResponse } from "next/server";
import { ITEM_LIMITS } from "@/features/items/domain/limits";
import { saveImage } from "@/features/uploads/server/image-storage";
import { guardAdmin, jsonError } from "@/shared/server/http";

const MAX_FILES_PER_REQUEST = ITEM_LIMITS.extraImagesMax + 1;

export async function POST(request: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const files = form?.getAll("files").filter((entry): entry is File => entry instanceof File) ?? [];
  if (files.length === 0) return jsonError(400, "Nenhum arquivo enviado");
  if (files.length > MAX_FILES_PER_REQUEST) {
    return jsonError(400, `Envie no máximo ${MAX_FILES_PER_REQUEST} arquivos por vez`);
  }

  const results = await Promise.all(files.map(saveImage));
  const names = results.flatMap((r) => (r.ok ? [r.name] : []));
  const errors = results.flatMap((r) => (r.ok ? [] : [r.error]));
  return NextResponse.json({ names, errors }, { status: names.length ? 201 : 422 });
}
