"use client";

import { ArrowLeftIcon, ArrowRightIcon, ImagePlusIcon, StarIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ITEM_LIMITS } from "../../domain/limits";
import { imageUrl } from "../../image-url";

/** A primeira foto é a principal (capa da vitrine); o formulário a separa em mainImage + images ao salvar. */
type Props = {
  photos: string[];
  onChange: (next: string[]) => void;
};

const MAX_PHOTOS = ITEM_LIMITS.extraImagesMax + 1;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

async function upload(files: File[]): Promise<{ names: string[]; errors: string[] }> {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const response = await fetch("/api/uploads", { method: "POST", body });
  const data = await response.json().catch(() => null);
  return { names: data?.names ?? [], errors: data?.errors ?? [data?.error ?? "Falha no upload"] };
}

export function ImagesField({ photos, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const remaining = MAX_PHOTOS - photos.length;

  async function addFiles(files: FileList | File[] | null) {
    const images = [...(files ?? [])].filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;
    const selected = images.slice(0, remaining);
    setBusy(true);
    const result = await upload(selected);
    setBusy(false);
    const skipped = images.length - selected.length;
    setErrors([
      ...result.errors.filter(Boolean),
      ...(skipped > 0 ? [`Limite de ${MAX_PHOTOS} fotos: ${skipped} ${skipped === 1 ? "foto foi ignorada" : "fotos foram ignoradas"}.`] : []),
    ]);
    if (result.names.length) onChange([...photos, ...result.names]);
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= photos.length) return;
    const next = [...photos];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
    setStatus(to === 0 ? "Foto definida como principal." : `Foto movida para a posição ${to + 1} de ${photos.length}.`);
  }

  function remove(index: number) {
    onChange(photos.filter((_, i) => i !== index));
    setStatus(`Foto ${index + 1} removida.`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <p className="text-xs font-semibold tracking-wide uppercase">
          Fotos ({photos.length}/{MAX_PHOTOS}) *
        </p>
        <p className="text-xs text-muted-foreground">
          {photos.length > 1 ? "Arraste ou use as setas para ordenar. " : ""}A primeira foto é a principal, exibida na vitrine.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((name, i) => (
          <li
            key={name}
            draggable={photos.length > 1}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", name);
              setDragFrom(i);
            }}
            onDragOver={(event) => {
              if (dragFrom === null) return;
              event.preventDefault();
              setDragOver(i);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragFrom !== null) move(dragFrom, i);
              setDragFrom(null);
              setDragOver(null);
            }}
            onDragEnd={() => {
              setDragFrom(null);
              setDragOver(null);
            }}
            className={`border-2 bg-card ${i === 0 ? "border-accent outline-2 outline-foreground" : "border-foreground"} ${
              dragFrom === i ? "opacity-40" : ""
            } ${dragOver === i && dragFrom !== i ? "ring-3 ring-ring" : ""}`}
          >
            <div className={`relative aspect-square bg-muted ${photos.length > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}>
              <Image src={imageUrl(name)} alt={`Foto ${i + 1} de ${photos.length}`} fill sizes="(min-width: 768px) 20vw, 40vw" draggable={false} className="object-cover" />
              <span className="absolute top-1.5 left-1.5 border-2 border-foreground bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground">
                {i === 0 ? "Principal" : i + 1}
              </span>
            </div>
            <div className="flex border-t-2 border-foreground">
              <TileButton label={`Mover foto ${i + 1} para a esquerda`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                <ArrowLeftIcon />
              </TileButton>
              <TileButton label={`Mover foto ${i + 1} para a direita`} disabled={i === photos.length - 1} onClick={() => move(i, i + 1)}>
                <ArrowRightIcon />
              </TileButton>
              <TileButton label={`Tornar a foto ${i + 1} a principal`} disabled={i === 0} onClick={() => move(i, 0)}>
                <StarIcon />
              </TileButton>
              <TileButton label={`Remover foto ${i + 1}`} danger onClick={() => remove(i)}>
                <XIcon />
              </TileButton>
            </div>
          </li>
        ))}

        {remaining > 0 && (
          <li>
            <label
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes("Files")) event.preventDefault();
              }}
              onDrop={(event) => {
                if (!event.dataTransfer.files.length) return;
                event.preventDefault();
                void addFiles(event.dataTransfer.files);
              }}
              className={`flex aspect-square min-h-11 cursor-pointer flex-col items-center justify-center gap-1.5 border-2 border-dashed border-foreground bg-card p-2 text-center text-sm font-semibold transition-colors hover:bg-muted focus-within:ring-3 focus-within:ring-ring ${
                busy ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <ImagePlusIcon className="size-6" aria-hidden="true" />
              {busy ? "Enviando..." : photos.length ? "Adicionar fotos" : "Enviar fotos"}
              <span className="text-xs font-normal text-muted-foreground">ou solte aqui</span>
              <input
                type="file"
                accept={ACCEPT}
                multiple
                className="sr-only"
                onChange={(event) => {
                  void addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </li>
        )}
      </ul>

      <p role="status" className="sr-only">
        {busy ? "Enviando fotos" : status}
      </p>
      {errors.map((error) => (
        <p key={error} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ))}
    </div>
  );
}

type TileButtonProps = { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode };

function TileButton({ label, onClick, disabled, danger, children }: TileButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-11 flex-1 items-center justify-center border-r-2 border-foreground outline-none last:border-r-0 hover:bg-muted focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-4 ${
        danger ? "text-destructive hover:bg-destructive/10" : ""
      }`}
    >
      {children}
    </button>
  );
}
