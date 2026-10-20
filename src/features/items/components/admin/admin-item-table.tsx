import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/features/auth/server/session";
import { ITEM_STATUSES } from "../../domain/item";
import { formatCents } from "../../domain/price";
import { imageUrl } from "../../image-url";
import { itemRepository } from "../../server/container";
import { ItemActionsMenu } from "./item-actions-menu";

export async function AdminItemTable() {
  await connection();
  await requireAdmin();
  const items = await itemRepository().list();

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Nenhum item ainda. <Link href="/admin/itens/novo" className="underline">Cadastre o primeiro</Link>.
      </p>
    );
  }

  return (
    <ul className="divide-y-2 divide-foreground border-2 border-foreground bg-card">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 p-3">
          <div className="relative size-14 shrink-0 overflow-hidden border-2 border-foreground bg-muted">
            <Image src={imageUrl(item.mainImage)} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {item.isLot && item.priceCents === 0 ? "Itens diversos" : formatCents(item.priceCents)} · {ITEM_STATUSES[item.status]} · ID {item.id}
            </p>
          </div>
          <ItemActionsMenu id={item.id} title={item.title} />
        </li>
      ))}
    </ul>
  );
}
