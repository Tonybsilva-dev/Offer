import { describe, expect, it } from "vitest";
import { detectImageType } from "./image-type";

const bytes = (...parts: (number[] | string)[]) =>
  new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));

describe("detectImageType", () => {
  it("detecta formatos suportados", () => {
    expect(detectImageType(bytes([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpg");
    expect(detectImageType(bytes([0x89], "PNG", [0x0d, 0x0a]))).toBe("png");
    expect(detectImageType(bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "))).toBe("webp");
    expect(detectImageType(bytes([0, 0, 0, 0x20], "ftypavif"))).toBe("avif");
  });

  it("rejeita outros conteúdos", () => {
    expect(detectImageType(bytes("<svg xmlns="))).toBeNull();
    expect(detectImageType(bytes("GIF89a"))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});
