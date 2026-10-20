import type { SqlClient } from "../sql-client";
import { createItems } from "./001-create-items";
import { addItemLot } from "./002-add-item-lot";

export type Migration = { id: string; statements: string[] };

export const MIGRATIONS: Migration[] = [createItems, addItemLot];

const LOCK_KEY = 4_820_301; // advisory lock exclusivo do Bazar

/** Aplica migrações pendentes em ordem. Use uma conexão dedicada (o lock é por sessão). */
export async function runMigrations(db: SqlClient) {
  await db.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
  try {
    await db.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())",
    );
    const { rows } = await db.query<{ id: string }>("SELECT id FROM schema_migrations");
    const applied = new Set(rows.map((row) => row.id));
    for (const migration of MIGRATIONS) {
      if (applied.has(migration.id)) continue;
      await db.query("BEGIN");
      try {
        for (const statement of migration.statements) await db.query(statement);
        await db.query("INSERT INTO schema_migrations (id) VALUES ($1)", [migration.id]);
        await db.query("COMMIT");
      } catch (error) {
        await db.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await db.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
  }
}
