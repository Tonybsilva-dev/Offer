import { ImageResponse } from "next/og";
import { BrandMark, ogFonts, OG_TYPE } from "@/shared/og/og-kit";

export const size = { width: 180, height: 180 };
export const contentType = OG_TYPE;

export default async function AppleIcon() {
  return new ImageResponse(<BrandMark px={size.width} />, { ...size, fonts: await ogFonts() });
}
