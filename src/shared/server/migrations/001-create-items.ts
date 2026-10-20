// Migração imutável: não editar após aplicada. Mudanças vão em uma nova migração.
export const createItems = {
  id: "001-create-items",
  statements: [
    `    CREATE TABLE items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT '',
      brand TEXT NOT NULL,
      condition TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price_cents INTEGER NOT NULL CHECK (price_cents > 0),
      is_lowest_price BOOLEAN NOT NULL DEFAULT FALSE,
      accepts_trade BOOLEAN NOT NULL DEFAULT FALSE,
      tags TEXT[] NOT NULL DEFAULT '{}',
      specs JSONB NOT NULL DEFAULT '[]',
      details JSONB NOT NULL DEFAULT '[]',
      main_image TEXT NOT NULL,
      images TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    "CREATE INDEX items_created_at_idx ON items (created_at DESC)",
  ],
};
