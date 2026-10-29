import "server-only";
import { nanoid } from "nanoid";
import { IMAGE_NAME_PATTERN } from "@/features/items/domain/limits";
import { env } from "@/shared/server/env";
import { detectImageType, IMAGE_CONTENT_TYPES, MAX_UPLOAD_BYTES, type ImageExtension } from "../domain/image-type";
import type { ImageStore } from "./image-store";
import { LocalImageStore } from "./local-image-store";
import { R2ImageStore } from "./r2-image-store";
import { toWebp } from "./to-webp";

let store: ImageStore | null = null;

function imageStore(): ImageStore {
  if (!store) {
    const r2 = env.r2();
    if (!r2 && process.env.NODE_ENV === "production") throw new Error("Configuração R2_* ausente");
    store = r2 ? new R2ImageStore(r2) : new LocalImageStore();
  }
  return store;
}

export type SaveResult = { ok: true; name: string } | { ok: false; error: string };

export async function saveImage(file: File): Promise<SaveResult> {
  if (file.size === 0) return { ok: false, error: `${file.name}: arquivo vazio` };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: `${file.name}: excede 5 MB` };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = detectImageType(bytes);
  if (!extension) return { ok: false, error: `${file.name}: formato não suportado` };

  let webp: Uint8Array;
  try {
    webp = await toWebp(bytes, extension);
  } catch {
    return { ok: false, error: `${file.name}: imagem corrompida ou ilegível` };
  }

  const name = `${nanoid(16)}.webp`;
  await imageStore().put(name, webp, IMAGE_CONTENT_TYPES.webp);
  return { ok: true, name };
}

export async function readImage(name: string) {
  if (!IMAGE_NAME_PATTERN.test(name)) return null;
  const image = await imageStore().get(name);
  if (!image) return null;
  // Tipo derivado do nome validado, nunca do que veio do armazenamento.
  const extension = name.split(".").pop() as ImageExtension;
  return { data: image.data, contentType: IMAGE_CONTENT_TYPES[extension] };
}
