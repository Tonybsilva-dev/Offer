import { describe, expect, it } from "vitest";
import { parseItemInput } from "./item-schema";
import { parsePriceToCents } from "./price";
import { buildWhatsAppLink } from "./whatsapp";
import { makeItemPayload } from "../testing/item-factory";

describe("parsePriceToCents", () => {
  it.each([
    ["1.250,00", 125000],
    ["1250,5", 125050],
    ["1250.50", 125050],
    ["R$ 89,90", 8990],
    ["1.000", 100000],
    [350, 35000],
  ])("converte %s", (input, expected) => {
    expect(parsePriceToCents(input)).toBe(expected);
  });

  it.each(["", "abc", "0", "-10", "1,2,3", "12.345.67"])("rejeita %s", (input) => {
    expect(parsePriceToCents(input)).toBeNull();
  });
});

describe("parsePriceToCents com allowZero", () => {
  it.each([["0", 0], ["0,00", 0], ["", 0], ["  ", 0], ["15,00", 1500]])("aceita %s", (input, expected) => {
    expect(parsePriceToCents(input, { allowZero: true })).toBe(expected);
  });

  it("continua rejeitando valores inválidos", () => {
    expect(parsePriceToCents("abc", { allowZero: true })).toBeNull();
    expect(parsePriceToCents("-1", { allowZero: true })).toBeNull();
  });
});

describe("parseItemInput", () => {
  it("aceita lote de itens diversos com valor 0 ou vazio", () => {
    for (const price of ["0", "", 0]) {
      const result = parseItemInput(makeItemPayload({ isLot: true, price }));
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.priceCents).toBe(0);
    }
  });

  it("exige valor positivo quando não é lote", () => {
    for (const price of ["0", ""]) {
      expect(parseItemInput(makeItemPayload({ isLot: false, price })).ok).toBe(false);
    }
  });

  it("aceita item válido e normaliza tags e preço", () => {
    const result = parseItemInput(makeItemPayload({ tags: ["Bike", "bike", "Aro 29"] }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.priceCents).toBe(150000);
    expect(result.value.tags).toEqual(["bike", "aro 29"]);
  });

  it("exige imagem principal", () => {
    const result = parseItemInput(makeItemPayload({ mainImage: "" }));
    expect(result.ok).toBe(false);
  });

  it("limita a 10 imagens adicionais", () => {
    const images = Array.from({ length: 11 }, (_, i) => `img000000${i.toString().padStart(2, "0")}.jpg`);
    const result = parseItemInput(makeItemPayload({ images }));
    expect(result.ok).toBe(false);
  });

  it("bloqueia nomes de imagem com path traversal", () => {
    const result = parseItemInput(makeItemPayload({ mainImage: "../../etc/passwd.jpg" }));
    expect(result.ok).toBe(false);
  });

  it("rejeita valor inválido", () => {
    const result = parseItemInput(makeItemPayload({ price: "grátis" }));
    expect(result.ok && result.value).toBe(false);
  });

  it("rejeita chaves de especificação repetidas", () => {
    const specs = [{ key: "Cor", value: "Preto" }, { key: "cor", value: "Azul" }];
    const result = parseItemInput(makeItemPayload({ specs }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].message).toContain("Chave repetida");
  });

  it("aceita especificações livres por item", () => {
    const bike = parseItemInput(makeItemPayload({ specs: [{ key: "Aro", value: "29" }] }));
    const headset = parseItemInput(makeItemPayload({ specs: [{ key: "Conexão", value: "Bluetooth 5.3" }] }));
    expect(bike.ok && headset.ok).toBe(true);
  });
});

describe("buildWhatsAppLink", () => {
  it("monta link com ID e URL do item", () => {
    const link = buildWhatsAppLink({
      phone: "+55 (83) 99999-0000",
      item: { id: "abc123", title: "Bicicleta" },
      baseUrl: "https://bazar.exemplo.com/",
    });
    expect(link).toMatch(/^https:\/\/wa\.me\/5583999990000\?text=/);
    const text = decodeURIComponent(link!.split("text=")[1]);
    expect(text).toContain("ID: abc123");
    expect(text).toContain("https://bazar.exemplo.com/item/abc123");
  });

  it("retorna null sem número válido", () => {
    expect(buildWhatsAppLink({ phone: "", item: { id: "x", title: "y" }, baseUrl: "" })).toBeNull();
  });
});
