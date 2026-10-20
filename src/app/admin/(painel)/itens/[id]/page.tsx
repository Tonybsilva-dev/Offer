import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireAdmin } from "@/features/auth/server/session";
import { ItemForm } from "@/features/items/components/admin/item-form";
import { itemRepository } from "@/features/items/server/container";

async function EditItem({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  await requireAdmin();
  const item = await itemRepository().findById((await params).id);
  if (!item) notFound();
  return <ItemForm item={item} />;
}

export default function EditItemPage({ params }: PageProps<"/admin/itens/[id]">) {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Editar item</h1>
      <Suspense fallback={<p className="text-muted">Carregando...</p>}>
        <EditItem params={params} />
      </Suspense>
    </section>
  );
}
