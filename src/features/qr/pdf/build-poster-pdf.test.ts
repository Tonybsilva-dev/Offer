import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildQrLayout } from "../domain/qr-shapes";
import { buildPosterPdf } from "./build-poster-pdf";

afterEach(() => vi.unstubAllGlobals());

describe("buildPosterPdf", () => {
  it("gera um cartaz A4 de uma página com a Space Grotesk embutida", async () => {
    vi.stubGlobal("fetch", async (input: string) => {
      const file = await readFile(path.join(process.cwd(), "public", input));
      return new Response(new Uint8Array(file));
    });
    const url = "https://offer.antoniobsilva.com.br";
    const doc = await buildPosterPdf(buildQrLayout(url), {
      title: "Itens à venda e para troca",
      subtitle: "Aponte a câmera do celular para o QR Code e veja tudo no site.",
      url,
    });

    expect(doc.getNumberOfPages()).toBe(1);
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(210);
    expect(doc.internal.pageSize.getHeight()).toBeCloseTo(297);
    expect(doc.output("arraybuffer").byteLength).toBeGreaterThan(50_000);
    expect(Object.keys(doc.getFontList())).toContain("SpaceGrotesk");
  });

  it("falha com mensagem clara quando a fonte não carrega", async () => {
    vi.stubGlobal("fetch", async () => new Response("", { status: 404 }));
    await expect(buildPosterPdf(buildQrLayout("https://offer.antoniobsilva.com.br"), { title: "x", subtitle: "", url: "https://a.com" })).rejects.toThrow(
      "Fonte indisponível",
    );
  });
});
