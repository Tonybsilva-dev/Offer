import path from "node:path";

// Dados locais de desenvolvimento (PGlite e uploads sem R2): fora do trace do bundle.
export const DATA_DIR = path.resolve(
  /*turbopackIgnore: true*/ process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data"),
);
export const UPLOADS_DIR = path.join(/*turbopackIgnore: true*/ DATA_DIR, "uploads");

export function uploadPath(name: string) {
  return path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, name);
}
