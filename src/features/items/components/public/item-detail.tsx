import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/shared/server/env";
import { getBaseUrl } from "@/shared/server/base-url";
import { allImages } from "../../domain/item";
import { buildWhatsAppLink } from "../../domain/whatsapp";
import { itemRepository } from "../../server/container";
import { ItemAccordion } from "./item-accordion";
import { ItemGallery } from "./item-gallery";
import { ItemSpecsTable } from "./item-specs-table";
import { ItemSummary } from "./item-summary";
import { WhatsAppButton } from "./whatsapp-button";

export async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const item = await itemRepository().findById(id);
  if (!item) notFound();

  const whatsappHref = buildWhatsAppLink({ phone: env.whatsappNumber(), item, baseUrl: await getBaseUrl() });

  return (
    <article className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <ItemGallery images={allImages(item)} alt={item.title} />
        <div className="space-y-6">
          <ItemSummary item={item} />
          <WhatsAppButton href={whatsappHref} disabled={item.status === "vendido"} />
        </div>
      </div>

      {item.description && (
        <section>
          <h2 className="mb-2 text-xl font-bold">Descrição</h2>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{item.description}</p>
        </section>
      )}

      <ItemAccordion details={item.details} />
      <ItemSpecsTable item={item} />
      <WhatsAppButton href={whatsappHref} disabled={item.status === "vendido"} />
      <p className="text-center text-xs text-muted-foreground">ID do item: {item.id}</p>
    </article>
  );
}

export function ItemDetailSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2" aria-busy="true">
      <Skeleton className="aspect-square" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-10 w-1/3" />
      </div>
    </div>
  );
}
