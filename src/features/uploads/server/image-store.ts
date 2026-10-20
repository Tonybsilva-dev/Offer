export type StoredImage = { data: Uint8Array; contentType: string };

/** Porta de armazenamento binário das fotos. Nomes já validados pelo chamador. */
export interface ImageStore {
  put(name: string, data: Uint8Array, contentType: string): Promise<void>;
  get(name: string): Promise<StoredImage | null>;
}
