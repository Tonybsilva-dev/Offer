import { connection } from "next/server";
import { Skeleton } from "@/components/ui/skeleton";
import { itemRepository } from "../../server/container";
import { ItemCard } from "./item-card";

export async function ItemGrid({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  await connection();
  const { q } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  const items = await itemRepository().list({ query });

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        {query ? `Nenhum item encontrado para "${query}".` : "Nenhum item cadastrado ainda."}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} />
        </li>
      ))}
    </ul>
  );
}

export function ItemGridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i}>
          <Skeleton className="aspect-[1/1.15]" />
        </li>
      ))}
    </ul>
  );
}
