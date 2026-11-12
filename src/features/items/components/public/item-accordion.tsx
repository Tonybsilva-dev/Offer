import type { ItemDetail } from "../../domain/item";

export function ItemAccordion({ details }: { details: ItemDetail[] }) {
  if (details.length === 0) return null;
  return (
    <div className="divide-y-2 divide-foreground border-2 border-foreground bg-card">
      {details.map((detail, i) => (
        <details key={i} className="group px-4 py-3" open={i === 0}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring">
            {detail.title}
            <span aria-hidden="true" className="text-muted-foreground transition group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-2 whitespace-pre-line break-words text-sm text-muted-foreground">{detail.content}</p>
        </details>
      ))}
    </div>
  );
}
