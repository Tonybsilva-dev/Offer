import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ItemDetail, ItemDetailSkeleton } from "@/features/items/components/public/item-detail";
import { itemRepository } from "@/features/items/server/container";
import { ITEM_CONDITIONS } from "@/features/items/domain/item";
import { formatCents } from "@/features/items/domain/price";
import { SiteHeader } from "@/shared/ui/site-header";

export async function generateMetadata({ params }: PageProps<"/item/[id]">): Promise<Metadata> {
  const item = await itemRepository().findById((await params).id);
  if (!item) return { title: "Item não encontrado" };
  const title = item.fullName || item.title;
  const price = item.isLot && item.priceCents === 0 ? "Itens diversos" : formatCents(item.priceCents);
  const summary = `${price} · ${ITEM_CONDITIONS[item.condition]} · ${item.brand}`;
  const description = item.description.trim() ? `${summary}. ${item.description.trim().slice(0, 140)}` : summary;
  // A imagem de compartilhamento vem de opengraph-image.tsx, gerada por item.
  return {
    title,
    description,
    alternates: { canonical: `/item/${item.id}` },
    openGraph: { type: "website", title, description, url: `/item/${item.id}` },
    twitter: { card: "summary_large_image", title, description },
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
