"use client";

import { inputClass } from "./form-fields";

type Column<T> = { name: keyof T & string; placeholder: string; multiline?: boolean };

type Props<T extends Record<string, string>> = {
  rows: T[];
  columns: [Column<T>, Column<T>];
  empty: T;
  addLabel: string;
  max: number;
  onChange: (rows: T[]) => void;
};

export function KeyValueList<T extends Record<string, string>>(props: Props<T>) {
  const { rows, columns, empty, addLabel, max, onChange } = props;

  const update = (index: number, name: keyof T, value: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [name]: value } : row)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={index} className="flex items-start gap-2">
          {columns.map((col) => {
            const common = {
              value: row[col.name],
              placeholder: col.placeholder,
              "aria-label": col.placeholder,
            };
            return col.multiline ? (
              <textarea
                key={col.name}
                {...common}
                rows={2}
                onChange={(e) => update(index, col.name, e.target.value)}
                className={`${inputClass} flex-[2]`}
              />
            ) : (
              <input
                key={col.name}
                {...common}
                onChange={(e) => update(index, col.name, e.target.value)}
                className={`${inputClass} flex-1`}
              />
            );
          })}
          <div className="flex shrink-0 text-muted">
            <IconButton label="Subir" onClick={() => move(index, -1)}>↑</IconButton>
            <IconButton label="Descer" onClick={() => move(index, 1)}>↓</IconButton>
            <IconButton label="Remover" onClick={() => onChange(rows.filter((_, i) => i !== index))}>
              ✕
            </IconButton>
          </div>
        </div>
      ))}
      {rows.length < max && (
        <button
          type="button"
          onClick={() => onChange([...rows, { ...empty }])}
          className="text-sm font-medium hover:underline"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}

type IconButtonProps = { label: string; onClick: () => void; children: React.ReactNode };

function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded px-2 py-2 hover:bg-border/50"
    >
      {children}
    </button>
  );
}
