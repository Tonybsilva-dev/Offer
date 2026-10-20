import { ImageResponse } from "next/og";
import { env } from "@/shared/server/env";
import { BrandCard, hostOf, ogFonts, OG_SIZE, OG_TYPE } from "@/shared/og/og-kit";

export const alt = "Offer: itens à venda e para troca";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return new ImageResponse(<BrandCard headline="Itens à venda e para troca" host={hostOf(env.siteUrl())} />, {
    ...size,
    fonts: await ogFonts(),
  });
}
