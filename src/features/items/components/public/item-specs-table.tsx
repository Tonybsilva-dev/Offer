import { ITEM_CONDITIONS, type Item } from "../../domain/item";

export function ItemSpecsTable({ item }: { item: Item }) {
  const rows = [
    { key: "Marca", value: item.brand },
    { key: "Estado", value: ITEM_CONDITIONS[item.condition] },
    ...item.specs,
  ];
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Especificações</h2>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.key}-${i}`} className="odd:bg-border/30">
                <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-medium align-top">
                  {row.key}
                </th>
                <td className="px-4 py-2.5 text-muted">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
