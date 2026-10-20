import Form from "next/form";

export function SearchForm() {
  return (
    <Form action="/" className="flex w-full max-w-sm gap-2">
      <input
        name="q"
        type="search"
        placeholder="Buscar itens"
        aria-label="Buscar itens"
        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground"
      />
      <button className="rounded-lg bg-foreground px-3 py-1.5 text-sm text-background">Buscar</button>
    </Form>
  );
}
