"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Item } from "../../domain/item";
import type { ItemPayload } from "../../domain/item-schema";
import { centsToInput } from "../../domain/price";

export type ItemFormState = Required<Omit<ItemPayload, "price">> & { price: string };

const EMPTY: ItemFormState = {
  title: "",
  fullName: "",
  brand: "",
  condition: "usado",
  status: "disponivel",
  description: "",
  price: "",
  isLot: false,
  isLowestPrice: false,
  acceptsTrade: false,
  tags: [],
  specs: [],
  details: [],
  mainImage: "",
  images: [],
};

function fromItem(item: Item): ItemFormState {
  return {
    title: item.title,
    fullName: item.fullName,
    brand: item.brand,
    condition: item.condition,
    status: item.status,
    description: item.description,
    price: item.priceCents > 0 ? centsToInput(item.priceCents) : "",
    isLot: item.isLot,
    isLowestPrice: item.isLowestPrice,
    acceptsTrade: item.acceptsTrade,
    tags: item.tags,
    specs: item.specs,
    details: item.details,
    mainImage: item.mainImage,
    images: item.images,
  };
}

type ApiError = { error: string; details?: { path: string; message: string }[] };

const FIELD_LABELS: Record<string, string> = {
  title: "Título curto",
  fullName: "Nome completo",
  brand: "Marca",
  price: "Valor",
  mainImage: "Imagem principal",
  images: "Fotos",
  tags: "Tags",
  condition: "Estado",
  status: "Situação",
};
const LIST_LABELS: Record<string, string> = { specs: "Especificação", details: "Informações extras" };
const SUBFIELD_LABELS: Record<string, string> = { key: "chave", value: "valor", title: "título", content: "conteúdo" };

/** "specs.3.key" vira "Especificação 4 (chave)": o índice do servidor começa em 0, o do usuário em 1. */
function describeError({ path, message }: { path: string; message: string }) {
  const [field, index, sub] = path.split(".");
  if (LIST_LABELS[field] && index !== undefined) {
    const where = sub ? ` (${SUBFIELD_LABELS[sub] ?? sub})` : "";
    return `${LIST_LABELS[field]} ${Number(index) + 1}${where}: ${message}`;
  }
  return FIELD_LABELS[field] ? `${FIELD_LABELS[field]}: ${message}` : message;
}

/** Linhas totalmente em branco (criadas em "Adicionar" e deixadas vazias) não são enviadas. */
function withoutBlankRows(state: ItemFormState): ItemFormState {
  const filled = (...values: string[]) => values.some((value) => value.trim() !== "");
  return {
    ...state,
    specs: state.specs.filter((row) => filled(row.key, row.value)),
    details: state.details.filter((row) => filled(row.title, row.content)),
  };
}

export function useItemForm(item?: Item) {
  const router = useRouter();
  const [state, setState] = useState<ItemFormState>(item ? fromItem(item) : EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ItemFormState>(key: K, value: ItemFormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors([]);
    const response = await fetch(item ? `/api/items/${item.id}` : "/api/items", {
      method: item ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(withoutBlankRows(state)),
    });
    setSaving(false);

    if (response.status === 401) return router.replace("/admin/login");
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiError | null;
      const details = body?.details?.map(describeError);
      setErrors(details?.length ? details : [body?.error ?? "Erro ao salvar"]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Com cacheComponents o Next mantém esta tela viva (oculta) ao navegar; sem isso, o próximo
    // "Novo item" reabriria com os dados do item recém-cadastrado.
    if (!item) setState(EMPTY);
    router.push("/admin");
    router.refresh();
  }

  return { state, set, submit, errors, saving };
}
