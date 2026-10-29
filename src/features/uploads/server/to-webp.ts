import "server-only";
import sharp from "sharp";
import type { ImageExtension } from "../domain/image-type";

export const WEBP_QUALITY = 82;

/**
 * Converte a imagem enviada para WebP antes de ir ao armazenamento.
 * Aplica a orientação do EXIF e descarta os metadados (localização, câmera).
 * Quem já é WebP segue intacto, para não recomprimir com perda.
 */
export async function toWebp(bytes: Uint8Array, source: ImageExtension): Promise<Uint8Array> {
  if (source === "webp") return bytes;
  const output = await sharp(bytes).rotate().webp({ quality: WEBP_QUALITY }).toBuffer();
  return new Uint8Array(output);
}
