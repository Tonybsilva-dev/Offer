import { describe, expect, it } from "vitest";
import { parseItemInput } from "./item-schema";
import { buildWhatsAppLink } from "./whatsapp";
import { makeItemPayload } from "../testing/item-factory";

describe("item contact and category", () => {
  it("defaults older payloads to the global contact and other category", () => {
    const result = parseItemInput(makeItemPayload());
    expect(result.ok && result.value.category).toBe("outros");
    expect(result.ok && result.value.whatsappNumber).toBe("");
  });
  it("accepts the health and beauty category", () => {
    const result = parseItemInput({ ...makeItemPayload(), category: "saude-estetica" });
    expect(result.ok && result.value.category).toBe("saude-estetica");
  });
  it("rejects unknown categories, conditions and invalid contacts", () => {
    for (const override of [{ category: "invalid" }, { condition: "invalid" }, { whatsappNumber: "abc" }, { whatsappNumber: "123" }, { whatsappNumber: "1234567890123456" }]) {
      expect(parseItemInput({ ...makeItemPayload(), ...override }).ok).toBe(false);
    }
  });
  it("prefers the item contact and falls back when blank", () => {
    const input = { phone: "5585999991111", baseUrl: "https://example.com", item: { id: "abc", title: "Bike", whatsappNumber: "5585999992222" } };
    expect(buildWhatsAppLink(input)).toContain("https://wa.me/5585999992222?");
    expect(buildWhatsAppLink({ ...input, item: { ...input.item, whatsappNumber: "" } })).toContain("https://wa.me/5585999991111?");
    expect(buildWhatsAppLink({ ...input, phone: "", item: { ...input.item, whatsappNumber: "" } })).toBeNull();
  });
});
