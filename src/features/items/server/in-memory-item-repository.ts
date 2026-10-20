import type { Item, ItemInput } from "../domain/item";
import { generateItemId } from "./item-id";
import { matchesQuery, type ItemListFilter, type ItemRepository } from "./item-repository";

export class InMemoryItemRepository implements ItemRepository {
  private items = new Map<string, Item>();

  constructor(private now: () => Date = () => new Date()) {}

  async list(filter?: ItemListFilter) {
    return [...this.items.values()]
      .filter((item) => matchesQuery(item, filter?.query))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string) {
    return this.items.get(id) ?? null;
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

  async remove(id: string) {
    return this.items.delete(id);
  }
}
