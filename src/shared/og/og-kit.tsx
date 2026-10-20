import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { BRAND_THEME as C } from "@/shared/brand/theme";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

const FONT_FILES = { bold: "SpaceGrotesk_700Bold.ttf", medium: "SpaceGrotesk_500Medium.ttf" } as const;
const font = (file: string) => readFile(path.join(process.cwd(), "public", "fonts", file));

/** Space Grotesk (a mesma da aplicação) para o ImageResponse. */
export async function ogFonts() {
  const [bold, medium] = await Promise.all([font(FONT_FILES.bold), font(FONT_FILES.medium)]);
  return [
    { name: "Space Grotesk", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Space Grotesk", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

/** Marca do Offer: quadrado tangerina com borda de tinta e a letra O. */
export function BrandMark({ px }: { px: number }) {
  return (
    <div
      style={{
        width: px,
        height: px,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: C.accent,
        border: `${Math.max(2, Math.round(px / 9))}px solid ${C.ink}`,
        color: C.ink,
        fontFamily: "Space Grotesk",
        fontWeight: 700,
        fontSize: Math.round(px * 0.66),
        lineHeight: 1,
      }}
    >
      O
    </div>
  );
}

export function HostPill({ host }: { host: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        background: C.accent,
        border: `4px solid ${C.ink}`,
        color: C.ink,
        padding: "8px 22px",
        fontSize: 30,
        fontWeight: 700,
      }}
    >
      {host}
    </div>
  );
}

export const hostOf = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Cartão genérico da marca (home e itens que não existem mais). */
export function BrandCard({ headline, host }: { headline: string; host: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: C.background,
        color: C.ink,
        fontFamily: "Space Grotesk",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <BrandMark px={72} />
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>OFFER</div>
      </div>
      <div style={{ display: "flex", fontSize: 112, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>{headline}</div>
      {host ? <HostPill host={host} /> : <div style={{ display: "flex" }} />}
    </div>
  );
}
