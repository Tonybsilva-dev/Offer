import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/features/auth/server/session";
import { itemRepository } from "../../server/container";
import { AdminItemList } from "./admin-item-list";

export async function AdminItemTable() {
  await connection();
  await requireAdmin();
  const items = await itemRepository().list({ includeHidden: true });

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Nenhum item ainda. <Link href="/admin/itens/novo" className="underline">Cadastre o primeiro</Link>.
      </p>
    );
  }

  // Só o que a lista usa vai ao cliente (sem descrição, specs e detalhes).
  return (
    <AdminItemList
      items={items.map(({ id, title, brand, category, status, hidden, priceCents, isLot, mainImage, whatsappNumber }) => ({
        id,
        title,
        brand,
        category,
        status,
        hidden,
        priceCents,
        isLot,
        mainImage,
        whatsappNumber,
      }))}
    />
  );
}
