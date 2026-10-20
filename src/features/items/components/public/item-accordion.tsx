import type { ItemDetail } from "../../domain/item";

export function ItemAccordion({ details }: { details: ItemDetail[] }) {
  if (details.length === 0) return null;
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {details.map((detail, i) => (
        <details key={i} className="group px-4 py-3" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
            {detail.title}
            <span className="text-muted transition group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-2 whitespace-pre-line text-sm text-muted">{detail.content}</p>
        </details>
      ))}
    </div>
  );
}
