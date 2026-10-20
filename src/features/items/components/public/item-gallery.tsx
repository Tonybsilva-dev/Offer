"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { imageUrl } from "../../image-url";

export function ItemGallery({ images, alt }: { images: string[]; alt: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function goTo(next: number) {
    const target = (next + images.length) % images.length;
    track.current?.scrollTo({ left: target * track.current.clientWidth, behavior: "smooth" });
    setIndex(target);
  }

  function onScroll() {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden border-2 border-foreground bg-card">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        >
          {images.map((name, i) => (
            <div key={name} className="relative w-full shrink-0 snap-center">
              <Image
                src={imageUrl(name)}
                alt={`${alt} (foto ${i + 1} de ${images.length})`}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <NavButton label="Foto anterior" onClick={() => goTo(index - 1)} side="left" />
            <NavButton label="Próxima foto" onClick={() => goTo(index + 1)} side="right" />
            <span className="absolute bottom-2 right-2 border-2 border-foreground bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
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
              aria-current={i === index}
              className={`relative size-16 shrink-0 overflow-hidden border-2 ${
                i === index ? "border-accent outline-2 outline-foreground" : "border-foreground opacity-70"
              }`}
            >
              <Image src={imageUrl(name)} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavButton({ label, onClick, side }: { label: string; onClick: () => void; side: "left" | "right" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 ${side === "left" ? "left-2" : "right-2"} -translate-y-1/2 border-2 border-foreground bg-card px-3 py-1.5 text-lg font-bold text-foreground hover:bg-accent`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
