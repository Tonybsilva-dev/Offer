import type { Item, ItemInput } from "../domain/item";

export type ItemListFilter = { query?: string; category?: string; condition?: string; includeHidden?: boolean };
/** Itens ocultos só saem do repositório quando o painel pede (includeHidden); o padrão é seguro para o público. */
export type ItemLookup = { includeHidden?: boolean };
export type ItemSearchParams = { q?: string | string[]; category?: string | string[]; condition?: string | string[] };

export function parseItemFilters(params: ItemSearchParams): ItemListFilter {
  const first = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;
  return { query: first(params.q), category: first(params.category), condition: first(params.condition) };
}

export function matchesFilter(item: Item, filter?: ItemListFilter): boolean {
  return (!item.hidden || filter?.includeHidden === true)
    && matchesQuery(item, filter?.query)
    && (!filter?.category || item.category === filter.category)
    && (!filter?.condition || item.condition === filter.condition);
}

export interface ItemRepository {
  list(filter?: ItemListFilter): Promise<Item[]>;
  findById(id: string, lookup?: ItemLookup): Promise<Item | null>;
  create(input: ItemInput): Promise<Item>;
  update(id: string, input: ItemInput): Promise<Item | null>;
  setHidden(id: string, hidden: boolean): Promise<Item | null>;
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
