import type { Item } from "./item";

type WhatsAppLinkInput = {
  phone: string;
  item: Pick<Item, "id" | "title">;
  baseUrl: string;
};

export function buildItemUrl(baseUrl: string, id: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/item/${encodeURIComponent(id)}`;
}

export function buildWhatsAppMessage(item: Pick<Item, "id" | "title">, itemUrl: string) {
  return [
    `Olá! Tenho interesse no item "${item.title}" (ID: ${item.id}).`,
    "Ainda está disponível?",
    itemUrl,
  ].join("\n");
}

export function buildWhatsAppLink({ phone, item, baseUrl }: WhatsAppLinkInput): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const message = buildWhatsAppMessage(item, buildItemUrl(baseUrl, item.id));
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
