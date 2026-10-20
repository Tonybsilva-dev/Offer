"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import { useRef, useState } from "react";
import { imageUrl } from "../../image-url";

type Props = {
  images: string[];
  alt: string;
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
};

export function ImageLightbox({ images, alt, index, open, onOpenChange, onIndexChange }: Props) {
  const total = images.length;
  const step = (delta: number) => onIndexChange((index + delta + total) % total);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/95" />
        <Dialog.Popup
          className="fixed inset-0 z-50 flex flex-col text-white outline-none"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") step(-1);
            if (event.key === "ArrowRight") step(1);
          }}
        >
          <Dialog.Title className="sr-only">{alt}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Foto {index + 1} de {total}. Use as setas ou deslize para trocar, pinça ou toque duplo para ampliar.
          </Dialog.Description>

          <div className="flex items-center justify-between px-4 py-3">
            <span className="border-2 border-white px-2 py-0.5 text-sm font-semibold" aria-live="polite">
              {index + 1}/{total}
            </span>
            <Dialog.Close className={`${CONTROL} px-3 py-1.5 text-sm`}>Fechar ✕</Dialog.Close>
          </div>

          <div className="relative min-h-0 flex-1">
            <ZoomStage key={`${index}-${images[index]}`} name={images[index]} alt={`${alt} (foto ${index + 1} de ${total})`} onStep={step} swipeEnabled={total > 1} />
            {total > 1 && (
              <>
                <NavButton label="Foto anterior" side="left" onClick={() => step(-1)} />
                <NavButton label="Próxima foto" side="right" onClick={() => step(1)} />
              </>
            )}
          </div>

          <p className="px-4 py-3 text-center text-xs text-white/70">Pinça ou toque duplo para ampliar</p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const CONTROL = "border-2 border-white bg-black/60 font-bold text-white hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function NavButton({ label, side, onClick }: { label: string; side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`${CONTROL} absolute top-1/2 hidden -translate-y-1/2 px-3 py-2 text-xl md:block ${side === "left" ? "left-4" : "right-4"}`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_MS = 300;
const SWIPE_MIN_PX = 60;

type Point = { x: number; y: number };
type View = { scale: number; x: number; y: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Foto com zoom (pinça, toque duplo, roda do mouse), arrasto quando ampliada e deslize para trocar quando não. */
function ZoomStage({ name, alt, onStep, swipeEnabled }: { name: string; alt: string; onStep: (delta: number) => void; swipeEnabled: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const swipeStart = useRef<Point | null>(null);
  const lastTap = useRef<{ time: number; point: Point } | null>(null);
  const pointerType = useRef("mouse");

  function bounded(next: View): View {
    const rect = stage.current?.getBoundingClientRect();
    if (!rect || next.scale <= MIN_SCALE) return { scale: MIN_SCALE, x: 0, y: 0 };
    const maxX = ((next.scale - 1) * rect.width) / 2;
    const maxY = ((next.scale - 1) * rect.height) / 2;
    return { scale: next.scale, x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
  }

  function toggleZoom() {
    setView((current) => (current.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.5, x: 0, y: 0 }));
  }

  function onPointerDown(event: React.PointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerType.current = event.pointerType;
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: distance(a, b), scale: view.scale };
      swipeStart.current = null;
      return;
    }

    swipeStart.current = point;
    if (event.pointerType === "touch") {
      const previous = lastTap.current;
      const now = Date.now();
      if (previous && now - previous.time < DOUBLE_TAP_MS && distance(previous.point, point) < 30) {
        lastTap.current = null;
        swipeStart.current = null;
        toggleZoom();
      } else {
        lastTap.current = { time: now, point };
      }
    }
  }

  function onPointerMove(event: React.PointerEvent) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);

    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const { distance: startDistance, scale: startScale } = pinch.current;
      const scale = clamp((startScale * distance(a, b)) / startDistance, MIN_SCALE, MAX_SCALE);
      setView((current) => bounded({ ...current, scale }));
      return;
    }

    if (pointers.current.size === 1 && view.scale > 1) {
      const dx = point.x - previous.x;
      const dy = point.y - previous.y;
      setView((current) => bounded({ ...current, x: current.x + dx, y: current.y + dy }));
    }
  }

  function onPointerUp(event: React.PointerEvent) {
    const start = swipeStart.current;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size > 0) return;

    swipeStart.current = null;
    if (start && swipeEnabled && view.scale <= 1) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) onStep(dx < 0 ? 1 : -1);
    }
    setView((current) => (current.scale < 1.05 ? { scale: 1, x: 0, y: 0 } : current));
  }

  function onPointerCancel(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId);
    pinch.current = null;
    swipeStart.current = null;
  }

  return (
    <div
      ref={stage}
      className="absolute inset-0 touch-none overflow-hidden select-none"
      style={{ cursor: view.scale > 1 ? "grab" : "zoom-in" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onDoubleClick={() => pointerType.current !== "touch" && toggleZoom()}
      onWheel={(event) => {
        const scale = clamp(view.scale * (event.deltaY < 0 ? 1.15 : 0.87), MIN_SCALE, MAX_SCALE);
        setView((current) => bounded({ ...current, scale }));
      }}
    >
      <Image
        src={imageUrl(name)}
        alt={alt}
        fill
        priority
        draggable={false}
        sizes="100vw"
        className="object-contain"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      />
    </div>
  );
}
