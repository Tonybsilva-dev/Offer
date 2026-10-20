import Image from "next/image";
import Link from "next/link";
import type { Item } from "../../domain/item";
import { imageUrl } from "../../image-url";

export function ItemCard({ item }: { item: Item }) {
  const sold = item.status === "vendido";
  return (
    <Link
      href={`/item/${item.id}`}
      className="group block overflow-hidden border-2 border-foreground bg-card shadow-hard-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard"
    >
      <div className="relative aspect-square border-b-2 border-foreground bg-muted">
        <Image
          src={imageUrl(item.mainImage)}
          alt={item.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={`object-cover transition group-hover:scale-[1.02] ${sold ? "opacity-50 grayscale" : ""}`}
        />
        {item.status !== "disponivel" && (
          <span className="absolute left-2 top-2 border-2 border-foreground bg-accent px-2 py-0.5 text-xs font-semibold tracking-wide text-accent-foreground uppercase">
            {sold ? "Vendido" : "Reservado"}
          </span>
        )}
      </div>
      <p className="truncate px-3 py-2.5 text-sm font-semibold">{item.title}</p>
    </Link>
  );
}
