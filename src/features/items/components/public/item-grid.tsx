import { connection } from "next/server";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { itemRepository } from "../../server/container";
import { parseItemFilters, type ItemSearchParams } from "../../server/item-repository";
import { ItemCard } from "./item-card";

export async function ItemGrid({ searchParams }: { searchParams: Promise<ItemSearchParams> }) {
  await connection();
  const filter = parseItemFilters(await searchParams);
  const hasFilters = Boolean(filter.query || filter.category || filter.condition);
  const items = await itemRepository().list(filter);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          {hasFilters ? "Nenhum item encontrado com os filtros selecionados." : "Nenhum item cadastrado ainda."}
        </p>
        {hasFilters && (
          <Link href="/" className="mt-3 inline-flex min-h-11 items-center px-3 text-sm font-medium underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50">
            Limpar filtros
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <p role="status" className="mb-3 text-sm text-muted-foreground">
        {items.length === 1 ? "1 item" : `${items.length} itens`}
      </p>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.id}>
            <ItemCard item={item} />
          </li>
        ))}
      </ul>
    </>
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
