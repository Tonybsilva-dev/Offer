import { describe, expect, it, vi } from "vitest";
import sharp, { type SharpOptions } from "sharp";

vi.mock("server-only", () => ({}));

const { toWebp } = await import("./to-webp");
const { detectImageType } = await import("../domain/image-type");

const raw = { width: 64, height: 32, channels: 3 as const, background: { r: 200, g: 40, b: 40 } };
const make = async (format: "jpeg" | "png" | "avif" | "webp", options: SharpOptions = { create: raw }) =>
  new Uint8Array(await sharp(options).toFormat(format).toBuffer());

describe("toWebp", () => {
  it.each([
    ["jpeg", "jpg"],
    ["png", "png"],
    ["avif", "avif"],
  ] as const)("converte %s para webp", async (format, extension) => {
    const out = await toWebp(await make(format), extension);
    expect(detectImageType(out)).toBe("webp");
    const meta = await sharp(out).metadata();
    expect([meta.width, meta.height]).toEqual([64, 32]);
  });

  it("mantém o WebP recebido sem recomprimir", async () => {
    const input = await make("webp");
    expect(await toWebp(input, "webp")).toBe(input);
  });

  it("aplica a orientação do EXIF e remove os metadados", async () => {
    const jpg = new Uint8Array(await sharp({ create: raw }).jpeg().withMetadata({ orientation: 6 }).toBuffer());
    const out = await toWebp(jpg, "jpg");
    const meta = await sharp(out).metadata();
    expect([meta.width, meta.height]).toEqual([32, 64]);
    expect(meta.exif).toBeUndefined();
  });

  it("rejeita bytes que não são imagem", async () => {
    await expect(toWebp(new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3]), "jpg")).rejects.toThrow();
  });
});
