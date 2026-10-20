import { Badge } from "@/shared/ui/badge";
import { ITEM_CONDITIONS, ITEM_STATUSES, type Item } from "../../domain/item";
import { formatCents } from "../../domain/price";

const STATUS_TONE = { disponivel: "success", reservado: "warning", vendido: "danger" } as const;

export function ItemSummary({ item }: { item: Item }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted">{item.brand}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{item.fullName || item.title}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone={STATUS_TONE[item.status]}>{ITEM_STATUSES[item.status]}</Badge>
        <Badge>{ITEM_CONDITIONS[item.condition]}</Badge>
        <Badge tone={item.acceptsTrade ? "success" : "neutral"}>
          {item.acceptsTrade ? "Aceita troca" : "Não aceita troca"}
        </Badge>
      </div>

      <div>
        <p className="text-3xl font-bold">{formatCents(item.priceCents)}</p>
        {item.isLowestPrice ? (
          <p className="mt-1 text-sm font-medium text-accent">Este já é o menor valor.</p>
        ) : (
          <p className="mt-1 text-sm text-muted">Valor negociável.</p>
        )}
      </div>

      {item.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
          {item.tags.map((tag) => (
            <li key={tag} className="rounded-md border border-border px-2 py-0.5 text-xs text-muted">
              #{tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
