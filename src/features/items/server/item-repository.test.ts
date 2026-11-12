import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { parseItemInput } from "../domain/item-schema";
import { makeItemPayload } from "../testing/item-factory";
import { InMemoryItemRepository } from "./in-memory-item-repository";
import type { ItemRepository } from "./item-repository";
import { PostgresItemRepository } from "./postgres-item-repository";
import { runMigrations } from "@/shared/server/migrations";

function input(overrides = {}) {
  const parsed = parseItemInput(makeItemPayload(overrides));
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.errors));
  return parsed.value;
}

async function postgres() {
  const db = new PGlite();
  await runMigrations(db);
  await runMigrations(db); // idempotente
  return new PostgresItemRepository(async () => db);
}

describe.each<[string, () => Promise<ItemRepository>]>([
  ["in-memory", async () => new InMemoryItemRepository()],
  ["postgres (PGlite)", postgres],
])("ItemRepository (%s)", (_, make) => {
  it("cria, lê, atualiza e remove", async () => {
    const repo = await make();
    const created = await repo.create(input({ specs: [{ key: "Aro", value: "29" }] }));
    expect(created.id).toHaveLength(8);
    expect(await repo.findById(created.id)).toEqual(created);

    const updated = await repo.update(created.id, input({ title: "Bike", acceptsTrade: false }));
    expect(updated?.title).toBe("Bike");
    expect(updated?.acceptsTrade).toBe(false);
    expect(updated?.specs).toEqual([{ key: "Aro", value: "29" }]);

    expect(await repo.remove(created.id)).toBe(true);
    expect(await repo.findById(created.id)).toBeNull();
  });

  it("retorna null ao atualizar item inexistente", async () => {
    expect(await (await make()).update("naoexiste", input())).toBeNull();
  });

  it("busca por título, marca e tags sem acento", async () => {
    const repo = await make();
    await repo.create(input({ title: "Bicicleta", brand: "Caloi", tags: ["mobilidade"] }));
    await repo.create(input({ title: "Headset", brand: "HyperX", tags: ["áudio"] }));
    expect((await repo.list({ query: "hyperx" })).map((i) => i.title)).toEqual(["Headset"]);
    expect((await repo.list({ query: "audio" })).map((i) => i.title)).toEqual(["Headset"]);
    expect((await repo.list({ query: "bicicleta caloi" })).map((i) => i.title)).toEqual(["Bicicleta"]);
    expect(await repo.list()).toHaveLength(2);
  });
  it("oculta itens da vitrine mas os mantém para o painel", async () => {
    const repo = await make();
    const visible = await repo.create(input({ title: "Visível" }));
    const hidden = await repo.create(input({ title: "Escondido", hidden: true }));
    expect((await repo.list()).map((i) => i.id)).toEqual([visible.id]);
    expect(await repo.findById(hidden.id)).toBeNull();
    expect((await repo.list({ includeHidden: true })).map((i) => i.id).sort()).toEqual([visible.id, hidden.id].sort());
    expect((await repo.findById(hidden.id, { includeHidden: true }))?.hidden).toBe(true);

    expect((await repo.setHidden(visible.id, true))?.hidden).toBe(true);
    expect(await repo.list()).toEqual([]);
    expect((await repo.setHidden(visible.id, false))?.hidden).toBe(false);
    expect((await repo.list()).map((i) => i.id)).toEqual([visible.id]);
    expect(await repo.setHidden("inexistente", true)).toBeNull();
  });
  it("persists contact and combines category, condition and text filters", async () => {
    const repo = await make();
    const bike = await repo.create(input({ category: "esportes-lazer", whatsappNumber: "+55 (85) 99999-9999" }));
    await repo.create(input({ title: "Headset", category: "informatica", condition: "novo" }));
    expect((await repo.findById(bike.id))?.whatsappNumber).toBe("5585999999999");
    expect(await repo.list({ category: "esportes-lazer", condition: "seminovo", query: "caloi" })).toEqual([bike]);
    expect(await repo.list({ category: "esportes-lazer", condition: "novo" })).toEqual([]);
    const updated = await repo.update(bike.id, input({ category: "outros", whatsappNumber: "" }));
    expect(updated?.category).toBe("outros");
    expect(updated?.whatsappNumber).toBe("");
  });

});
