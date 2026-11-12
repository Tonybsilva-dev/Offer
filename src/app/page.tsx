import { Suspense } from "react";
import { ItemGrid, ItemGridSkeleton } from "@/features/items/components/public/item-grid";
import { SearchForm } from "@/features/items/components/public/search-form";
import { SiteHeader } from "@/shared/ui/site-header";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="sr-only">Itens à venda e para troca</h1>
        <Suspense fallback={<div className="mb-6 h-20" aria-busy="true" />}>
          <SearchForm searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<ItemGridSkeleton />}>
          <ItemGrid searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
