import { describe, expect, it } from "vitest";
import { createSessionToken, safeEqual, SESSION_TTL_SECONDS, verifySessionToken } from "./session-token";

const SECRET = "segredo-de-teste-com-32-caracteres!!";

describe("session token", () => {
  it("valida token assinado e dentro do prazo", () => {
    expect(verifySessionToken(createSessionToken(SECRET), SECRET)).toBe(true);
  });

  it("rejeita token expirado", () => {
    const token = createSessionToken(SECRET, 0);
    expect(verifySessionToken(token, SECRET, SESSION_TTL_SECONDS * 1000 + 1)).toBe(false);
  });

  it("rejeita assinatura adulterada ou segredo diferente", () => {
    const token = createSessionToken(SECRET);
    const [exp] = token.split(".");
    expect(verifySessionToken(`${Number(exp) + 999}.${token.split(".")[1]}`, SECRET)).toBe(false);
    expect(verifySessionToken(token, "outro-segredo")).toBe(false);
    expect(verifySessionToken(undefined, SECRET)).toBe(false);
  });

  it("compara strings em tempo constante", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
