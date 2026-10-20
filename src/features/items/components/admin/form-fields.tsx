import { Checkbox as UiCheckbox } from "@/components/ui/checkbox";
import { Select as UiSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <UiSelect value={value} items={options} onValueChange={(next) => next && onChange(next as T)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(options) as [T, string][]).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
}
