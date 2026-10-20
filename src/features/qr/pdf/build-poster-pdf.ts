import type { jsPDF } from "jspdf";
import type { QrLayout } from "../domain/qr-shapes";
import { QR_THEME } from "../domain/theme";

export type PosterContent = { title: string; subtitle: string; url: string };

const FONTS = {
  bold: "/fonts/SpaceGrotesk_700Bold.ttf",
  medium: "/fonts/SpaceGrotesk_500Medium.ttf",
} as const;

const PAGE = { width: 210, height: 297, margin: 16 };
const BORDER = 0.8;
const SHADOW = 3;
const PT_TO_MM = 0.3528;

async function loadFont(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Fonte indisponível: ${path}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** Cartaz A4 no visual do app: papel creme, tinta petróleo, tangerina, bordas firmes e sombra dura. */
export async function buildPosterPdf(layout: QrLayout, content: PosterContent): Promise<jsPDF> {
  const { jsPDF } = await import("jspdf");
  const [bold, medium] = await Promise.all([loadFont(FONTS.bold), loadFont(FONTS.medium)]);
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.addFileToVFS("SpaceGrotesk-Bold.ttf", bold);
  doc.addFont("SpaceGrotesk-Bold.ttf", "SpaceGrotesk", "bold");
  doc.addFileToVFS("SpaceGrotesk-Medium.ttf", medium);
  doc.addFont("SpaceGrotesk-Medium.ttf", "SpaceGrotesk", "normal");

  const c = QR_THEME;
  const { margin, width, height } = PAGE;
  const inner = width - margin * 2;
  const box = (x: number, y: number, w: number, h: number, fill: string, stroke = true) => {
    doc.setFillColor(fill);
    doc.setDrawColor(c.ink);
    doc.setLineWidth(BORDER);
    doc.rect(x, y, w, h, stroke ? "FD" : "F");
  };

  doc.setFillColor(c.background);
  doc.rect(0, 0, width, height, "F");

  // Cabeçalho: marca + legenda.
  const markSize = 9;
  box(margin, margin, markSize, markSize, c.accent);
  doc.setFont("SpaceGrotesk", "bold").setFontSize(26).setTextColor(c.ink);
  doc.text("OFFER", margin + markSize + 4, margin + markSize - 1.2);
  doc.setFont("SpaceGrotesk", "bold").setFontSize(8.5).setTextColor(c.muted);
  doc.text("ITENS À VENDA E PARA TROCA", width - margin, margin + markSize - 1.6, { align: "right", charSpace: 0.4 });
  doc.setDrawColor(c.ink).setLineWidth(BORDER);
  doc.line(margin, margin + markSize + 5, width - margin, margin + markSize + 5);

  // Título e subtítulo.
  let y = margin + markSize + 24;
  doc.setFont("SpaceGrotesk", "bold").setFontSize(44).setTextColor(c.ink);
  const titleLines = doc.splitTextToSize(content.title, inner) as string[];
  doc.text(titleLines, margin, y, { lineHeightFactor: 1.05 });
  y += titleLines.length * 44 * PT_TO_MM * 1.05 + 4;
  if (content.subtitle.trim()) {
    doc.setFont("SpaceGrotesk", "normal").setFontSize(15).setTextColor(c.muted);
    const subtitleLines = doc.splitTextToSize(content.subtitle, inner) as string[];
    doc.text(subtitleLines, margin, y + 4, { lineHeightFactor: 1.25 });
    y += subtitleLines.length * 15 * PT_TO_MM * 1.25 + 4;
  }

  // Cartão do QR com sombra dura.
  const card = 118;
  const cardX = (width - card) / 2 - SHADOW / 2;
  const cardY = Math.max(y + 12, 128);
  box(cardX + SHADOW, cardY + SHADOW, card, card, c.ink, false);
  box(cardX, cardY, card, card, c.card);
  const unit = card / layout.total;
  for (const shape of layout.shapes) {
    doc.setFillColor(c[shape.fill]);
    doc.rect(cardX + shape.x * unit, cardY + shape.y * unit, shape.size * unit, shape.size * unit, "F");
  }
  const letterPt = (layout.logo.size * unit * 0.62) / PT_TO_MM;
  doc.setFont("SpaceGrotesk", "bold").setFontSize(letterPt).setTextColor(c.ink);
  doc.text("O", cardX + (layout.logo.x + layout.logo.size / 2) * unit, cardY + (layout.logo.y + layout.logo.size / 2) * unit, {
    align: "center",
    baseline: "middle",
  });

  // Selo com o endereço.
  const label = content.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  doc.setFont("SpaceGrotesk", "bold").setFontSize(17);
  const labelWidth = Math.min(inner, doc.getTextWidth(label) + 14);
  const labelY = cardY + card + SHADOW + 12;
  box((width - labelWidth) / 2, labelY, labelWidth, 13, c.accent);
  doc.setTextColor(c.ink);
  doc.text(label, width / 2, labelY + 8.8, { align: "center" });

  // Rodapé.
  const footer = 16;
  box(0, height - footer, width, footer, c.ink, false);
  doc.setFont("SpaceGrotesk", "normal").setFontSize(10).setTextColor(c.background);
  doc.text("Fotos, valores e contato pelo WhatsApp em cada item.", width / 2, height - footer / 2 + 1.2, { align: "center" });

  return doc;
}
