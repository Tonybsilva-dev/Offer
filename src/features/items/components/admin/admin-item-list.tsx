"use client";

import { SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { ITEM_CATEGORIES, ITEM_STATUSES, type Item, type ItemStatus } from "../../domain/item";
import { formatCents } from "../../domain/price";
import { imageUrl } from "../../image-url";
import { ItemActionsMenu } from "./item-actions-menu";

export type AdminListItem = Pick<
  Item,
  "id" | "title" | "brand" | "category" | "status" | "hidden" | "priceCents" | "isLot" | "mainImage" | "whatsappNumber"
>;

const STATUS_TONE = { disponivel: "success", reservado: "warning", vendido: "danger" } as const;
type StatusFilter = ItemStatus | "todos" | "ocultos";

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function AdminItemList({ items }: { items: AdminListItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = { todos: items.length, disponivel: 0, reservado: 0, vendido: 0, ocultos: 0 };
    for (const item of items) {
      result[item.status] += 1;
      if (item.hidden) result.ocultos += 1;
    }
    return result;
  }, [items]);

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return items.filter((item) => {
      if (status === "ocultos" ? !item.hidden : status !== "todos" && item.status !== status) return false;
      const haystack = normalize(`${item.title} ${item.brand} ${item.id} ${ITEM_CATEGORIES[item.category]}`);
      return terms.every((term) => haystack.includes(term));
    });
  }, [items, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block space-y-1 text-sm sm:w-80">
          <span className="text-xs font-semibold tracking-wide uppercase">Buscar</span>
          <span className="relative block">
            <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Título, marca, categoria ou ID"
              autoComplete="off"
              className="h-11 w-full min-w-0 border-2 border-input bg-card pr-3 pl-9 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
          </span>
        </label>

        <div role="group" aria-label="Filtrar por situação" className="flex flex-wrap gap-2">
          {(["todos", "disponivel", "reservado", "vendido", "ocultos"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => setStatus(value)}
              className={`min-h-11 border-2 border-foreground px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring ${
                status === value ? "bg-foreground text-background" : "bg-card hover:bg-muted"
              }`}
            >
              {value === "todos" ? "Todos" : value === "ocultos" ? "Ocultos" : ITEM_STATUSES[value]} <span className="tabular-nums opacity-70">({counts[value]})</span>
            </button>
          ))}
        </div>
      </div>

      <p role="status" className="text-sm text-muted-foreground">
        {visible.length === items.length ? `${items.length} ${items.length === 1 ? "item" : "itens"}` : `${visible.length} de ${items.length} itens`}
      </p>

      {visible.length === 0 ? (
        <div className="border-2 border-dashed border-foreground py-12 text-center">
          <p className="text-muted-foreground">Nenhum item corresponde à busca.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("todos");
            }}
            className="mt-2 inline-flex min-h-11 items-center px-3 text-sm font-medium underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <ul className="divide-y-2 divide-foreground border-2 border-foreground bg-card">
          {visible.map((item) => (
            <li key={item.id} className={`flex items-center gap-3 p-3 ${item.hidden ? "bg-muted/60" : ""}`}>
              <Link
                href={`/admin/itens/${item.id}`}
                tabIndex={-1}
                aria-hidden="true"
                className="relative size-16 shrink-0 overflow-hidden border-2 border-foreground bg-muted"
              >
                <Image src={imageUrl(item.mainImage)} alt="" fill sizes="64px" className={`object-cover ${item.hidden ? "opacity-50 grayscale" : ""}`} />
              </Link>
              <div className="min-w-0 flex-1 space-y-1">
                <Link
                  href={`/admin/itens/${item.id}`}
                  className="block truncate font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
                >
                  {item.title}
                </Link>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Badge tone={STATUS_TONE[item.status]}>{ITEM_STATUSES[item.status]}</Badge>
                  {item.hidden && <Badge>Oculto</Badge>}
                  <span className="text-sm font-semibold tabular-nums">
                    {item.isLot && item.priceCents === 0 ? "Itens diversos" : formatCents(item.priceCents)}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {ITEM_CATEGORIES[item.category]} · {item.brand}
                  {item.whatsappNumber ? " · WhatsApp próprio" : ""} · ID {item.id}
                </p>
              </div>
              <ItemActionsMenu id={item.id} title={item.title} hidden={item.hidden} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
