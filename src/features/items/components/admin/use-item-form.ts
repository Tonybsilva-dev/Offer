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
    price: centsToInput(item.priceCents),
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
      body: JSON.stringify(state),
    });
    setSaving(false);

    if (response.status === 401) return router.replace("/admin/login");
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiError | null;
      const details = body?.details?.map((d) => `${d.path ? `${d.path}: ` : ""}${d.message}`);
      setErrors(details?.length ? details : [body?.error ?? "Erro ao salvar"]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return { state, set, submit, errors, saving };
}
