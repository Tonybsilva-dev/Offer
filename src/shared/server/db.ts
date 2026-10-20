import "server-only";
import path from "node:path";
import { env } from "./env";
import { runMigrations } from "./migrations";
import { DATA_DIR } from "./paths";
import type { SqlClient } from "./sql-client";

const globalForDb = globalThis as unknown as { bazarDb?: Promise<SqlClient> };

/** Conexão única por processo; aplica migrações na primeira chamada. */
export function getDb(): Promise<SqlClient> {
  globalForDb.bazarDb ??= connect().catch((error) => {
    globalForDb.bazarDb = undefined;
    throw error;
  });
  return globalForDb.bazarDb;
}

async function connect(): Promise<SqlClient> {
  const url = env.databaseUrl();
  if (url) return connectPostgres(url);
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL ausente");
  return connectLocal();
}

async function connectPostgres(url: string): Promise<SqlClient> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: url,
    max: 5,
    ssl: env.databaseSsl() ? { rejectUnauthorized: false } : undefined,
  });
  // Conexão ociosa derrubada pelo servidor: registra e deixa o pool reconectar, sem derrubar o processo.
  pool.on("error", (error) => console.error("[db] conexão ociosa encerrada:", error.message));
  const client = await pool.connect();
  try {
    await runMigrations(client);
  } finally {
    client.release();
  }
  return { query: (text, params) => pool.query(text, params as unknown[]) } as SqlClient;
}

/** Desenvolvimento sem DATABASE_URL: Postgres embutido (PGlite) em ./data/pglite. */
async function connectLocal(): Promise<SqlClient> {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(path.join(/*turbopackIgnore: true*/ DATA_DIR, "pglite"));
  await runMigrations(db);
  return db;
}
