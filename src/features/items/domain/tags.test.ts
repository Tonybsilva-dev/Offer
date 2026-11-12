import { describe, expect, it } from "vitest";
import { ITEM_LIMITS } from "./limits";
import { mergeTags } from "./tags";

describe("mergeTags", () => {
  it("splits a pasted list on commas", () => {
    const pasted = "cabo USB-C, cabo tipo C, cabo 3 metros, cabo 2.4A, USB-A para USB-C, cabo carregador, cabo para celular, carregamento rápido, transferência de dados, cabo branco, acessórios para celular, cabo longo.";
    expect(mergeTags([], pasted)).toEqual([
      "cabo usb-c", "cabo tipo c", "cabo 3 metros", "cabo 2.4a", "usb-a para usb-c", "cabo carregador",
      "cabo para celular", "carregamento rápido", "transferência de dados", "cabo branco", "acessórios para celular", "cabo longo",
    ]);
  });

  it("also splits on semicolons and line breaks, ignoring blanks and repeats", () => {
    expect(mergeTags(["bike"], "Bike; aro  29\n\n capacete ,, ")).toEqual(["bike", "aro 29", "capacete"]);
  });

  it("keeps the limits per tag and per item", () => {
    expect(mergeTags([], "x".repeat(50))).toEqual(["x".repeat(ITEM_LIMITS.tagMax)]);
    const many = Array.from({ length: 30 }, (_, i) => `tag ${i}`).join(",");
    expect(mergeTags([], many)).toHaveLength(ITEM_LIMITS.tagsMax);
  });
});
