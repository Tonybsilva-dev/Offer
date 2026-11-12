import type { Item, ItemInput } from "../domain/item";
import { generateItemId } from "./item-id";
import { matchesFilter, type ItemListFilter, type ItemLookup, type ItemRepository } from "./item-repository";

export class InMemoryItemRepository implements ItemRepository {
  private items = new Map<string, Item>();

  constructor(private now: () => Date = () => new Date()) {}

  async list(filter?: ItemListFilter) {
    return [...this.items.values()]
      .filter((item) => matchesFilter(item, filter))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string, lookup?: ItemLookup) {
    const item = this.items.get(id) ?? null;
    return item && (!item.hidden || lookup?.includeHidden) ? item : null;
  }

  async create(input: ItemInput) {
    const timestamp = this.now().toISOString();
    const item: Item = { ...input, id: generateItemId(), createdAt: timestamp, updatedAt: timestamp };
    this.items.set(item.id, item);
    return item;
  }

  async update(id: string, input: ItemInput) {
    const current = this.items.get(id);
    if (!current) return null;
    const item: Item = { ...current, ...input, updatedAt: this.now().toISOString() };
    this.items.set(id, item);
    return item;
  }

  async setHidden(id: string, hidden: boolean) {
    const current = this.items.get(id);
    if (!current) return null;
    const item: Item = { ...current, hidden, updatedAt: this.now().toISOString() };
    this.items.set(id, item);
    return item;
  }

  async remove(id: string) {
    return this.items.delete(id);
  }
}
