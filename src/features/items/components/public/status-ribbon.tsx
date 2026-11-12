import { ITEM_STATUSES, type ItemStatus } from "../../domain/item";

const TONE = {
  vendido: "bg-foreground text-background",
  reservado: "bg-warning text-foreground",
} as const;

/** Faixa sobre a foto de um item que não está mais disponível; não renderiza nada para "disponível". */
export function StatusRibbon({ status, size = "md" }: { status: ItemStatus; size?: "md" | "lg" }) {
  if (status === "disponivel") return null;
  return (
    <span
      className={`absolute inset-x-0 bottom-0 border-t-2 border-foreground text-center font-bold tracking-widest uppercase ${TONE[status]} ${
        size === "lg" ? "py-2 text-base" : "py-1.5 text-xs sm:text-sm"
      }`}
    >
      {ITEM_STATUSES[status]}
    </span>
  );
}
