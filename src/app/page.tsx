import { Suspense } from "react";
import { ItemGrid, ItemGridSkeleton } from "@/features/items/components/public/item-grid";
import { SearchForm } from "@/features/items/components/public/search-form";
import { SiteHeader } from "@/shared/ui/site-header";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <SiteHeader>
        <SearchForm />
      </SiteHeader>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Suspense fallback={<ItemGridSkeleton />}>
          <ItemGrid searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
