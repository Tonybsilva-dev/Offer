import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { QrGenerator } from "@/features/qr/components/qr-generator";
import { getBaseUrl } from "@/shared/server/base-url";

export const metadata: Metadata = { title: "QR Code" };

async function QrSection() {
  await connection();
  return <QrGenerator defaultUrl={await getBaseUrl()} />;
}

export default function QrCodePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">QR Code</h1>
      <p className="text-sm text-muted-foreground">
        Gere um QR Code que abre o site e baixe o cartaz em PDF, no mesmo visual da aplicação, para imprimir.
      </p>
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        <QrSection />
      </Suspense>
    </section>
  );
}
