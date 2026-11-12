import Image from "next/image";
import Link from "next/link";
import type { Item } from "../../domain/item";
import { imageUrl } from "../../image-url";
import { StatusRibbon } from "./status-ribbon";

export function ItemCard({ item }: { item: Item }) {
  const sold = item.status === "vendido";
  return (
    <Link
      href={`/item/${item.id}`}
      className="group block overflow-hidden border-2 border-foreground bg-card shadow-hard-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring motion-safe:hover:-translate-x-0.5 motion-safe:hover:-translate-y-0.5 hover:shadow-hard"
    >
      <div className="relative aspect-square border-b-2 border-foreground bg-muted">
        <Image
          src={imageUrl(item.mainImage)}
          alt={item.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={`object-cover transition motion-safe:group-hover:scale-[1.02] ${sold ? "opacity-50 grayscale" : ""}`}
        />
        <StatusRibbon status={item.status} />
      </div>
      <div className="px-3 py-2.5">
        <p className="truncate text-sm font-semibold" title={item.title}>{item.title}</p>
        {item.isLot && (
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Itens diversos</p>
        )}
      </div>
    </Link>
  );
}
