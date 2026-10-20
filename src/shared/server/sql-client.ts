/** Contrato mínimo atendido por pg (Pool/PoolClient) e PGlite. */
export type SqlClient = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
};
