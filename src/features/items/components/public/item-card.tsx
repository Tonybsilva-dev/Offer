import Image from "next/image";
import Link from "next/link";
import type { Item } from "../../domain/item";
import { imageUrl } from "../../image-url";

export function ItemCard({ item }: { item: Item }) {
  const sold = item.status === "vendido";
  return (
    <Link
      href={`/item/${item.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-border/40">
        <Image
          src={imageUrl(item.mainImage)}
          alt={item.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={`object-cover transition group-hover:scale-[1.02] ${sold ? "opacity-50 grayscale" : ""}`}
        />
        {item.status !== "disponivel" && (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
            {sold ? "Vendido" : "Reservado"}
          </span>
        )}
      </div>
      <p className="truncate px-3 py-2.5 text-sm font-medium">{item.title}</p>
    </Link>
  );
}
