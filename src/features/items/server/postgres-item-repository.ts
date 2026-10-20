import type { SqlClient } from "@/shared/server/sql-client";
import type { Item, ItemInput } from "../domain/item";
import { generateItemId } from "./item-id";
import { matchesQuery, type ItemListFilter, type ItemRepository } from "./item-repository";

type ItemRow = {
  id: string;
  title: string;
  full_name: string;
  brand: string;
  condition: Item["condition"];
  status: Item["status"];
  description: string;
  price_cents: number;
  is_lowest_price: boolean;
  accepts_trade: boolean;
  tags: string[];
  specs: Item["specs"];
  details: Item["details"];
  main_image: string;
  images: string[];
  created_at: Date | string;
  updated_at: Date | string;
};

// $1 = id; $2..$15 = campos editáveis, na ordem de toParams.
const FIELDS = `title, full_name, brand, condition, status, description, price_cents,
  is_lowest_price, accepts_trade, tags, specs, details, main_image, images`;
const VALUES = "$2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14, $15";

export class PostgresItemRepository implements ItemRepository {
  constructor(private db: () => Promise<SqlClient>) {}

  async list(filter?: ItemListFilter) {
    const { rows } = await (await this.db()).query<ItemRow>("SELECT * FROM items ORDER BY created_at DESC");
    // Volume de bazar é pequeno: a busca reaproveita a mesma regra do domínio (sem acento, todos os termos).
    return rows.map(toItem).filter((item) => matchesQuery(item, filter?.query));
  }

  async findById(id: string) {
    const { rows } = await (await this.db()).query<ItemRow>("SELECT * FROM items WHERE id = $1", [id]);
    return rows[0] ? toItem(rows[0]) : null;
  }

  async create(input: ItemInput) {
    const { rows } = await (await this.db()).query<ItemRow>(
      `INSERT INTO items (id, ${FIELDS}) VALUES ($1, ${VALUES}) RETURNING *`,
      [generateItemId(), ...toParams(input)],
    );
    return toItem(rows[0]);
  }

  async update(id: string, input: ItemInput) {
    const { rows } = await (await this.db()).query<ItemRow>(
      `UPDATE items SET (${FIELDS}, updated_at) = (${VALUES}, NOW()) WHERE id = $1 RETURNING *`,
      [id, ...toParams(input)],
    );
    return rows[0] ? toItem(rows[0]) : null;
  }

  async remove(id: string) {
    const { rows } = await (await this.db()).query("DELETE FROM items WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }
}

function toParams(input: ItemInput): unknown[] {
  return [
    input.title,
    input.fullName,
    input.brand,
    input.condition,
    input.status,
    input.description,
    input.priceCents,
    input.isLowestPrice,
    input.acceptsTrade,
    input.tags,
    JSON.stringify(input.specs),
    JSON.stringify(input.details),
    input.mainImage,
    input.images,
  ];
}

function toItem(row: ItemRow): Item {
  return {
    id: row.id,
    title: row.title,
    fullName: row.full_name,
    brand: row.brand,
    condition: row.condition,
    status: row.status,
    description: row.description,
    priceCents: row.price_cents,
    isLowestPrice: row.is_lowest_price,
    acceptsTrade: row.accepts_trade,
    tags: row.tags,
    specs: row.specs,
    details: row.details,
    mainImage: row.main_image,
    images: row.images,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}
