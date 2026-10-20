// Migração imutável: não editar após aplicada. Mudanças vão em uma nova migração.
// Lote de itens diversos: o preço individual vive nas especificações, então o valor do lote pode ser 0.
export const addItemLot = {
  id: "002-add-item-lot",
  statements: [
    "ALTER TABLE items ADD COLUMN is_lot BOOLEAN NOT NULL DEFAULT FALSE",
    "ALTER TABLE items DROP CONSTRAINT items_price_cents_check",
    "ALTER TABLE items ADD CONSTRAINT items_price_cents_check CHECK (price_cents >= 0)",
    "ALTER TABLE items ADD CONSTRAINT items_price_lot_check CHECK (is_lot OR price_cents > 0)",
  ],
};
