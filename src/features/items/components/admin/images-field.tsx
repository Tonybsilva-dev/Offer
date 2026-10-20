"use client";

import Image from "next/image";
import { useState } from "react";
import { ITEM_LIMITS } from "../../domain/limits";
import { imageUrl } from "../../image-url";

type Props = {
  mainImage: string;
  images: string[];
  onChange: (next: { mainImage: string; images: string[] }) => void;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

async function upload(files: FileList | File[]): Promise<{ names: string[]; errors: string[] }> {
  const body = new FormData();
  [...files].forEach((file) => body.append("files", file));
  const response = await fetch("/api/uploads", { method: "POST", body });
  const data = await response.json().catch(() => null);
  return { names: data?.names ?? [], errors: data?.errors ?? [data?.error ?? "Falha no upload"] };
}

export function ImagesField({ mainImage, images, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const remaining = ITEM_LIMITS.extraImagesMax - images.length;

  async function handle(files: FileList | null, target: "main" | "extra") {
    if (!files?.length) return;
    const selected = target === "main" ? [files[0]] : [...files].slice(0, remaining);
    setBusy(true);
    const result = await upload(selected);
    setBusy(false);
    setErrors(result.errors.filter(Boolean));
    if (!result.names.length) return;
    if (target === "main") onChange({ mainImage: result.names[0], images });
    else onChange({ mainImage, images: [...images, ...result.names] });
  }

  function promote(name: string) {
    const rest = images.filter((image) => image !== name);
    onChange({ mainImage: name, images: mainImage ? [mainImage, ...rest] : rest });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide uppercase">Imagem principal *</p>
        <div className="flex items-center gap-3">
          {mainImage ? <Thumb name={mainImage} /> : <div className="size-24 border-2 border-dashed border-foreground" />}
          <UploadButton label={mainImage ? "Trocar" : "Enviar"} disabled={busy} onFiles={(f) => handle(f, "main")} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide uppercase">
          Outras fotos ({images.length}/{ITEM_LIMITS.extraImagesMax})
        </p>
        <ul className="flex flex-wrap gap-3">
          {images.map((name) => (
            <li key={name} className="space-y-1">
              <Thumb name={name} />
              <div className="flex justify-between text-xs">
                <button type="button" onClick={() => promote(name)} className="hover:underline">Principal</button>
                <button
                  type="button"
                  onClick={() => onChange({ mainImage, images: images.filter((i) => i !== name) })}
                  className="text-destructive hover:underline"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
        {remaining > 0 && (
          <UploadButton label="Adicionar fotos" multiple disabled={busy} onFiles={(f) => handle(f, "extra")} />
        )}
      </div>

      {busy && <p className="text-sm text-muted-foreground">Enviando...</p>}
      {errors.map((error) => (
        <p key={error} className="text-sm text-destructive">{error}</p>
      ))}
    </div>
  );
}

function Thumb({ name }: { name: string }) {
  return (
    <div className="relative size-24 overflow-hidden border-2 border-foreground bg-muted">
      <Image src={imageUrl(name)} alt="" fill sizes="96px" className="object-cover" />
    </div>
  );
}

type UploadButtonProps = { label: string; multiple?: boolean; disabled?: boolean; onFiles: (files: FileList | null) => void };

function UploadButton({ label, multiple, disabled, onFiles }: UploadButtonProps) {
  return (
    <label className={`inline-block cursor-pointer border-2 border-foreground bg-card px-3 py-1.5 text-sm font-semibold shadow-hard-sm hover:bg-accent hover:text-accent-foreground ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      {label}
      <input
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}
