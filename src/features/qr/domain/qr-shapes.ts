import QRCode from "qrcode";
import { QR_THEME, type QrTheme } from "./theme";

export type QrShape = { x: number; y: number; size: number; fill: keyof QrTheme };

export type QrLayout = {
  /** Lado total em módulos, já com a zona de silêncio. */
  total: number;
  shapes: QrShape[];
  /** Selo central (quadrado em módulos). */
  logo: { x: number; y: number; size: number };
};

const QUIET_ZONE = 4;
const FINDER = 7;
const MODULE_INSET = 0.07;

export function isValidSiteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Monta o QR com correção de erro alta (H), módulos quadrados com respiro, olhos de localização
 * em tinta com miolo petróleo e um selo central em tangerina (a área do selo é coberta pela correção).
 */
export function buildQrLayout(url: string): QrLayout {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "H" });
  const size = modules.size;
  const total = size + QUIET_ZONE * 2;

  const logoSize = Math.max(3, Math.floor(size * 0.2) | 1);
  const logoStart = Math.floor((size - logoSize) / 2);
  const inLogo = (row: number, col: number) =>
    row >= logoStart && row < logoStart + logoSize && col >= logoStart && col < logoStart + logoSize;
  const inFinderZone = (row: number, col: number) =>
    (row < FINDER + 1 && col < FINDER + 1) ||
    (row < FINDER + 1 && col >= size - FINDER - 1) ||
    (row >= size - FINDER - 1 && col < FINDER + 1);

  const shapes: QrShape[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!modules.get(row, col) || inFinderZone(row, col) || inLogo(row, col)) continue;
      shapes.push({ x: QUIET_ZONE + col + MODULE_INSET, y: QUIET_ZONE + row + MODULE_INSET, size: 1 - MODULE_INSET * 2, fill: "ink" });
    }
  }

  const corners = [[0, 0], [0, size - FINDER], [size - FINDER, 0]];
  for (const [row, col] of corners) {
    const x = QUIET_ZONE + col;
    const y = QUIET_ZONE + row;
    shapes.push(
      { x, y, size: 7, fill: "ink" },
      { x: x + 1, y: y + 1, size: 5, fill: "card" },
      { x: x + 2, y: y + 2, size: 3, fill: "primary" },
    );
  }

  const logo = { x: QUIET_ZONE + logoStart, y: QUIET_ZONE + logoStart, size: logoSize };
  shapes.push(
    { ...logo, fill: "ink" },
    { x: logo.x + 0.3, y: logo.y + 0.3, size: logo.size - 0.6, fill: "accent" },
  );
  return { total, shapes, logo };
}

/** SVG autônomo (usa só formas e texto), para pré-visualizar e baixar. */
export function qrSvgMarkup(layout: QrLayout, theme: QrTheme = QR_THEME) {
  const rects = layout.shapes
    .map((s) => `<rect x="${s.x}" y="${s.y}" width="${s.size}" height="${s.size}" fill="${theme[s.fill]}"/>`)
    .join("");
  const { x, y, size } = layout.logo;
  const letter = `<text x="${x + size / 2}" y="${y + size / 2}" text-anchor="middle" dominant-baseline="central" font-family="'Space Grotesk', Arial, sans-serif" font-weight="700" font-size="${size * 0.62}" fill="${theme.ink}">O</text>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.total} ${layout.total}" shape-rendering="crispEdges">` +
    `<rect width="${layout.total}" height="${layout.total}" fill="${theme.card}"/>${rects}${letter}</svg>`
  );
}
