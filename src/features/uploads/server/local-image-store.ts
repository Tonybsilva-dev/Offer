import "server-only";
import fs from "node:fs/promises";
import { uploadPath, UPLOADS_DIR } from "@/shared/server/paths";
import type { ImageStore } from "./image-store";

/** Desenvolvimento sem R2: grava em ./data/uploads. */
export class LocalImageStore implements ImageStore {
  async put(name: string, data: Uint8Array) {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.writeFile(uploadPath(name), data);
  }

  async get(name: string) {
    try {
      return { data: new Uint8Array(await fs.readFile(uploadPath(name))), contentType: "" };
    } catch {
      return null;
    }
  }
}
