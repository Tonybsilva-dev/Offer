import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ItemDetail, ItemDetailSkeleton } from "@/features/items/components/public/item-detail";
import { itemRepository } from "@/features/items/server/container";
import { imageUrl } from "@/features/items/image-url";
import { SiteHeader } from "@/shared/ui/site-header";

export async function generateMetadata({ params }: PageProps<"/item/[id]">): Promise<Metadata> {
  const item = await itemRepository().findById((await params).id);
  if (!item) return { title: "Item não encontrado" };
  return {
    title: item.title,
    description: item.fullName || item.description.slice(0, 150),
    openGraph: { images: [imageUrl(item.mainImage)] },
  };
}

export default function ItemPage({ params }: PageProps<"/item/[id]">) {
  return (
    <>
      <SiteHeader>
        <Link href="/" className="text-sm font-semibold hover:underline">
          ← <span className="hidden sm:inline">Todos os </span>itens
        </Link>
      </SiteHeader>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Suspense fallback={<ItemDetailSkeleton />}>
          <ItemDetail params={params} />
        </Suspense>
      </main>
    </>
  );
}
