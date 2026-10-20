import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { env } from "@/shared/server/env";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });

const DESCRIPTION = "Itens à venda e para troca.";
const siteUrl = env.siteUrl();

export const metadata: Metadata = {
  // Base das URLs absolutas de og:image e canonical; sem ela, os links de compartilhamento apontam para localhost.
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: "Offer", template: "%s · Offer" },
  description: DESCRIPTION,
  applicationName: "Offer",
  openGraph: { type: "website", siteName: "Offer", locale: "pt_BR", title: "Offer", description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: "Offer", description: DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
