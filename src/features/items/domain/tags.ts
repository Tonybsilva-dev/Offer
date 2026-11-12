import { ITEM_LIMITS } from "./limits";

/** Vírgula, ponto e vírgula ou quebra de linha separam tags; espaço não, porque "aro 29" é uma tag só. */
export const TAG_SEPARATOR = /[,;\n\r]+/;

/** Junta às tags existentes as que vierem no texto (digitado ou colado), sem repetir e respeitando os limites. */
export function mergeTags(existing: string[], text: string): string[] {
  const merged = [...existing];
  for (const part of text.split(TAG_SEPARATOR)) {
    // "#" inicial e ponto final são sobra de lista colada ("#bike", "cabo longo."); ponto no meio fica ("2.4a").
    const clean = part.trim().replace(/^#+/, "").replace(/\.+$/, "").trim();
    const tag = clean.replace(/\s+/g, " ").toLowerCase().slice(0, ITEM_LIMITS.tagMax).trim();
    if (tag && !merged.includes(tag) && merged.length < ITEM_LIMITS.tagsMax) merged.push(tag);
  }
  return merged;
}
