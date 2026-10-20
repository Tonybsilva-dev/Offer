import jsQR from "jsqr";
import { describe, expect, it } from "vitest";
import { buildQrLayout, isValidSiteUrl, qrSvgMarkup } from "./qr-shapes";
import { BRAND_THEME } from "@/shared/brand/theme";

const SCALE = 8;

/** Rasteriza as formas do layout (como o PDF/SVG as desenham) para um leitor de QR de verdade. */
function rasterize(url: string) {
  const layout = buildQrLayout(url);
  const side = layout.total * SCALE;
  const data = new Uint8ClampedArray(side * side * 4);
  const paint = (x: number, y: number, size: number, hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    for (let py = Math.round(y * SCALE); py < Math.round((y + size) * SCALE); py++) {
      for (let px = Math.round(x * SCALE); px < Math.round((x + size) * SCALE); px++) {
        data.set([r, g, b, 255], (py * side + px) * 4);
      }
    }
  };
  paint(0, 0, layout.total, BRAND_THEME.card);
  for (const shape of layout.shapes) paint(shape.x, shape.y, shape.size, BRAND_THEME[shape.fill]);
  return { data, side };
}

describe("QR Code estilizado", () => {
  it.each(["https://offer.antoniobsilva.com.br", "https://offer.antoniobsilva.com.br/item/abc123?utm_source=cartaz"])(
    "continua legível por um leitor: %s",
    (url) => {
      const { data, side } = rasterize(url);
      expect(jsQR(data, side, side)?.data).toBe(url);
    },
  );

  it("valida o endereço do site", () => {
    expect(isValidSiteUrl("https://offer.antoniobsilva.com.br")).toBe(true);
    expect(isValidSiteUrl("offer.antoniobsilva.com.br")).toBe(false);
    expect(isValidSiteUrl("javascript:alert(1)")).toBe(false);
  });

  it("gera um SVG com viewBox quadrado e o selo central", () => {
    const layout = buildQrLayout("https://offer.antoniobsilva.com.br");
    const svg = qrSvgMarkup(layout);
    expect(svg).toContain(`viewBox="0 0 ${layout.total} ${layout.total}"`);
    expect(svg).toContain(">O</text>");
  });
});
