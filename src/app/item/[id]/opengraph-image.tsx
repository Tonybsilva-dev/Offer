import { ImageResponse } from "next/og";
import { connection } from "next/server";
import { ITEM_CONDITIONS, ITEM_STATUSES, type Item } from "@/features/items/domain/item";
import { formatCents } from "@/features/items/domain/price";
import { itemRepository } from "@/features/items/server/container";
import { readImage } from "@/features/uploads/server/image-storage";
import { BRAND_THEME as C } from "@/shared/brand/theme";
import { BrandCard, BrandMark, HostPill, hostOf, ogFonts, OG_SIZE, OG_TYPE } from "@/shared/og/og-kit";
import { env } from "@/shared/server/env";

export const alt = "Foto e valor do item no Offer";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

// O satori (ImageResponse) não decodifica AVIF; nesse caso o quadro fica sem foto.
const RENDERABLE = new Set(["image/jpeg", "image/png", "image/webp"]);

async function photoDataUrl(name: string) {
  try {
    const image = await readImage(name);
    if (!image || !RENDERABLE.has(image.contentType)) return null;
    return `data:${image.contentType};base64,${Buffer.from(image.data).toString("base64")}`;
  } catch {
    return null;
  }
}

function priceLabel(item: Item) {
  return item.isLot && item.priceCents === 0 ? "Itens diversos" : formatCents(item.priceCents);
}

function Chip({ children, highlight = false }: { children: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        border: `3px solid ${C.ink}`,
        background: highlight ? C.accent : C.card,
        color: C.ink,
        padding: "4px 16px",
        fontSize: 24,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      {children}
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const item = await itemRepository().findById(id);
  const host = hostOf(env.siteUrl());
  const fonts = await ogFonts();

  if (!item) return new ImageResponse(<BrandCard headline="Item não encontrado" host={host} />, { ...size, fonts });

  const photo = await photoDataUrl(item.mainImage);
  const name = item.fullName || item.title;
  const chips = [
    ...(item.isLot ? [{ label: "Lote", highlight: true }] : []),
    ...(item.status !== "disponivel" ? [{ label: ITEM_STATUSES[item.status], highlight: true }] : []),
    { label: ITEM_CONDITIONS[item.condition], highlight: false },
    ...(item.acceptsTrade ? [{ label: "Aceita troca", highlight: false }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "48px 64px 48px 48px",
          background: C.background,
          color: C.ink,
          fontFamily: "Space Grotesk",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 520,
            height: 520,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            background: C.card,
            border: `6px solid ${C.ink}`,
            boxShadow: `14px 14px 0 0 ${C.ink}`,
            overflow: "hidden",
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" width={508} height={508} style={{ width: 508, height: 508, objectFit: "cover" }} />
          ) : (
            <BrandMark px={200} />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, height: 520, marginLeft: 72, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <BrandMark px={44} />
            <div style={{ display: "flex", fontSize: 38, fontWeight: 700, letterSpacing: -0.5 }}>OFFER</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 2 }}>
              {item.brand}
            </div>
            <div
              style={{
                display: "block",
                fontSize: name.length > 90 ? 34 : name.length > 55 ? 40 : name.length > 36 ? 48 : 58,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                lineClamp: 3,
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -2, marginTop: 6 }}>{priceLabel(item)}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {chips.map((chip) => (
                <Chip key={chip.label} highlight={chip.highlight}>
                  {chip.label}
                </Chip>
              ))}
            </div>
          </div>

          {host ? <HostPill host={host} /> : <div style={{ display: "flex" }} />}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
