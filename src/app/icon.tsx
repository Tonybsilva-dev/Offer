import { ImageResponse } from "next/og";
import { BrandMark, ogFonts, OG_TYPE } from "@/shared/og/og-kit";

export const size = { width: 32, height: 32 };
export const contentType = OG_TYPE;

export default async function Icon() {
  return new ImageResponse(<BrandMark px={size.width} />, { ...size, fonts: await ogFonts() });
}
