/**
 * Converte "1.250,00", "1250,5", "1250.50" ou 1250 em centavos.
 * Retorna null quando o valor é inválido ou não positivo.
 */
export function parsePriceToCents(input: string | number): number | null {
  if (typeof input === "number") {
    return Number.isFinite(input) && input > 0 ? Math.round(input * 100) : null;
  }
  const raw = input.trim().replace(/^R\$\s*/i, "");
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+([.,]\d{1,2})?$/.test(raw)) return null;

  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(\.\d{3})+$/.test(raw)
      ? raw.replace(/\./g, "")
      : raw;

  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : null;
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
