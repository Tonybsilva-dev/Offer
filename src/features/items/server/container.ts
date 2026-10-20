import "server-only";
import { getDb } from "@/shared/server/db";
import type { ItemRepository } from "./item-repository";
import { PostgresItemRepository } from "./postgres-item-repository";

let repository: ItemRepository | null = null;

export function itemRepository(): ItemRepository {
  repository ??= new PostgresItemRepository(getDb);
  return repository;
}
