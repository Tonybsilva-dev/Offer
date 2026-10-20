"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildQrLayout, isValidSiteUrl, qrSvgMarkup } from "../domain/qr-shapes";

const FILE_NAME = "offer-qr-code";
const DEFAULT_TITLE = "Itens à venda e para troca";

function download(blob: Blob, name: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function QrGenerator({ defaultUrl }: { defaultUrl: string }) {
  const [url, setUrl] = useState(defaultUrl);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState("Aponte a câmera do celular para o QR Code e veja tudo no site.");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const layout = useMemo(() => {
    if (!isValidSiteUrl(url)) return null;
    try {
      return buildQrLayout(url);
    } catch {
      return null;
    }
  }, [url]);
  const svg = useMemo(() => (layout ? qrSvgMarkup(layout) : ""), [layout]);

  async function downloadPdf() {
    if (!layout) return;
    setBusy(true);
    setError("");
    try {
      const { buildPosterPdf } = await import("../pdf/build-poster-pdf");
      const doc = await buildPosterPdf(layout, { title: title.trim() || DEFAULT_TITLE, subtitle, url });
      doc.save(`${FILE_NAME}.pdf`);
    } catch {
      setError("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <label className="block space-y-1 text-sm">
          <span className="text-xs font-semibold tracking-wide uppercase">Endereço do site *</span>
          <Input value={url} inputMode="url" aria-invalid={!layout} onChange={(e) => setUrl(e.target.value.trim())} />
          <span className="block text-xs text-muted-foreground">
            {layout ? "O QR Code leva direto para este endereço." : "Informe um endereço completo, com https://"}
          </span>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-xs font-semibold tracking-wide uppercase">Título do cartaz</span>
          <Input value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-xs font-semibold tracking-wide uppercase">Subtítulo</span>
          <Textarea value={subtitle} rows={2} maxLength={120} onChange={(e) => setSubtitle(e.target.value)} />
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="button" variant="accent" size="lg" disabled={!layout || busy} onClick={downloadPdf}>
            {busy ? "Gerando..." : "Baixar cartaz em PDF"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={!layout}
            onClick={() => download(new Blob([svg], { type: "image/svg+xml" }), `${FILE_NAME}.svg`)}
          >
            Baixar QR em SVG
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide uppercase">Pré-visualização</p>
        <div className="border-2 border-foreground bg-card shadow-hard">
          {layout ? (
            <div role="img" aria-label="QR Code do site" dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <div className="grid aspect-square place-items-center p-6 text-center text-sm text-muted-foreground">
              Informe um endereço válido para gerar o QR Code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
