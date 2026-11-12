"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { imageUrl } from "../../image-url";
import type { ItemStatus } from "../../domain/item";
import { ImageLightbox } from "./image-lightbox";
import { StatusRibbon } from "./status-ribbon";

export function ItemGallery({ images, alt, status = "disponivel" }: { images: string[]; alt: string; status?: ItemStatus }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  // Foto de destino de uma rolagem programática: enquanto ela anima, onScroll não devolve o índice para a foto antiga.
  const settling = useRef<{ target: number; timer: ReturnType<typeof setTimeout> } | null>(null);

  useEffect(() => () => clearTimeout(settling.current?.timer), []);

  function stopSettling() {
    clearTimeout(settling.current?.timer);
    settling.current = null;
  }

  function goTo(next: number) {
    const el = track.current;
    const target = (next + images.length) % images.length;
    if (el) {
      const current = Math.round(el.scrollLeft / el.clientWidth);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Animar só entre fotos vizinhas; saltos (última -> primeira, miniatura distante) são diretos,
      // senão a rolagem suave atravessa todas as fotos do meio.
      const behavior = reduceMotion || Math.abs(target - current) > 1 ? "auto" : "smooth";
      stopSettling();
      if (behavior === "smooth") settling.current = { target, timer: setTimeout(stopSettling, 1000) };
      el.scrollTo({ left: target * el.clientWidth, behavior });
    }
    setIndex(target);
  }

  function onScroll() {
    const el = track.current;
    if (!el) return;
    const settle = settling.current;
    if (settle) {
      if (Math.abs(el.scrollLeft - settle.target * el.clientWidth) > 1) return;
      stopSettling();
    }
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="relative overflow-hidden border-2 border-foreground bg-card">
        <div
          ref={track}
          onScroll={onScroll}
          onPointerDown={stopSettling}
          onWheel={stopSettling}
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        >
          {images.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setExpanded(true)}
              aria-label={`Ampliar foto ${i + 1} de ${images.length}`}
              className="relative w-full shrink-0 cursor-zoom-in snap-center outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <Image
                src={imageUrl(name)}
                alt={`${alt} (foto ${i + 1} de ${images.length})`}
                fill
                loading="eager"
                fetchPriority={i === 0 ? "high" : "auto"}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain"
              />
            </button>
          ))}
        </div>
        <StatusRibbon status={status} size="lg" />
        {images.length > 1 && (
          <>
            <NavButton label="Foto anterior" onClick={() => goTo(index - 1)} side="left" />
            <NavButton label="Próxima foto" onClick={() => goTo(index + 1)} side="right" />
            <span className="absolute top-2 right-2 border-2 border-foreground bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
              {index + 1}/{images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`relative size-16 shrink-0 overflow-hidden border-2 outline-none focus-visible:ring-3 focus-visible:ring-ring ${
                i === index ? "border-accent outline-2 outline-foreground" : "border-foreground opacity-70"
              }`}
            >
              <Image src={imageUrl(name)} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <ImageLightbox
        images={images}
        alt={alt}
        index={index}
        open={expanded}
        onOpenChange={setExpanded}
        onIndexChange={goTo}
      />
    </div>
  );
}

function NavButton({ label, onClick, side }: { label: string; onClick: () => void; side: "left" | "right" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 ${side === "left" ? "left-2" : "right-2"} flex size-11 -translate-y-1/2 items-center justify-center border-2 border-foreground bg-card text-xl font-bold text-foreground outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring`}
    >
      <span aria-hidden="true">{side === "left" ? "‹" : "›"}</span>
    </button>
  );
}
