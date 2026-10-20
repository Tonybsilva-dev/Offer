import { Checkbox as UiCheckbox } from "@/components/ui/checkbox";

export const inputClass =
  "h-10 w-full border-2 border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-xs font-semibold tracking-wide uppercase">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

type CheckboxProps = { label: string; checked: boolean; onChange: (value: boolean) => void };

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <UiCheckbox checked={checked} onCheckedChange={(value) => onChange(value)} />
      {label}
    </label>
  );
}

export function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 border-2 border-foreground bg-card p-4">
      <legend className="bg-accent px-2 text-xs font-bold tracking-wide text-accent-foreground uppercase">{legend}</legend>
      {children}
    </fieldset>
  );
}

type SelectProps<T extends string> = {
  value: T;
  options: Record<T, string>;
  onChange: (value: T) => void;
};

export function Select<T extends string>({ value, options, onChange }: SelectProps<T>) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={inputClass}>
      {(Object.entries(options) as [T, string][]).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
