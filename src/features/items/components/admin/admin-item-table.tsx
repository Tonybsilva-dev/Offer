import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/features/auth/server/session";
import { ITEM_STATUSES } from "../../domain/item";
import { formatCents } from "../../domain/price";
import { imageUrl } from "../../image-url";
import { itemRepository } from "../../server/container";
import { DeleteItemButton } from "./delete-item-button";

export async function AdminItemTable() {
  await connection();
  await requireAdmin();
  const items = await itemRepository().list();

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted">
        Nenhum item ainda. <Link href="/admin/itens/novo" className="underline">Cadastre o primeiro</Link>.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 p-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-border/40">
            <Image src={imageUrl(item.mainImage)} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{item.title}</p>
            <p className="text-xs text-muted">
              {formatCents(item.priceCents)} · {ITEM_STATUSES[item.status]} · ID {item.id}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <Link href={`/item/${item.id}`} className="text-muted hover:text-foreground" target="_blank">
              Ver
            </Link>
            <Link href={`/admin/itens/${item.id}`} className="font-medium hover:underline">
              Editar
            </Link>
            <DeleteItemButton id={item.id} title={item.title} />
          </div>
        </li>
      ))}
    </ul>
  );
}
