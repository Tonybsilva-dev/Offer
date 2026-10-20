import type { Item, ItemInput } from "../domain/item";

export type ItemListFilter = { query?: string };

export interface ItemRepository {
  list(filter?: ItemListFilter): Promise<Item[]>;
  findById(id: string): Promise<Item | null>;
  create(input: ItemInput): Promise<Item>;
  update(id: string, input: ItemInput): Promise<Item | null>;
  remove(id: string): Promise<boolean>;
}

export function matchesQuery(item: Item, query?: string): boolean {
  const terms = normalize(query ?? "").split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalize(
    [item.title, item.fullName, item.brand, item.description, ...item.tags].join(" "),
  );
  return terms.every((term) => haystack.includes(term));
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
