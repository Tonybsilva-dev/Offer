import { Badge } from "@/shared/ui/badge";
import { ITEM_CONDITIONS, ITEM_STATUSES, type Item } from "../../domain/item";
import { formatCents } from "../../domain/price";

const STATUS_TONE = { disponivel: "success", reservado: "warning", vendido: "danger" } as const;

export function ItemSummary({ item }: { item: Item }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{item.brand}</p>
        <h1 className="text-3xl font-bold tracking-tight">{item.fullName || item.title}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone={STATUS_TONE[item.status]}>{ITEM_STATUSES[item.status]}</Badge>
        <Badge>{ITEM_CONDITIONS[item.condition]}</Badge>
        <Badge tone={item.acceptsTrade ? "success" : "neutral"}>
          {item.acceptsTrade ? "Aceita troca" : "Não aceita troca"}
        </Badge>
      </div>

      <div>
        <p className="text-4xl font-bold tracking-tight">{formatCents(item.priceCents)}</p>
        {item.isLowestPrice ? (
          <p className="mt-2 inline-block border-2 border-foreground bg-accent px-2 py-0.5 text-xs font-semibold tracking-wide text-accent-foreground uppercase">
            Este já é o menor valor
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Valor negociável.</p>
        )}
      </div>

      {item.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
          {item.tags.map((tag) => (
            <li key={tag} className="border-2 border-border px-2 py-0.5 text-xs text-muted-foreground">
              #{tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
