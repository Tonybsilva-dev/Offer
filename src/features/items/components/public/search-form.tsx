import Form from "next/form";
import Link from "next/link";
import { connection } from "next/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ITEM_CATEGORIES, ITEM_CONDITIONS } from "../../domain/item";
import { parseItemFilters, type ItemSearchParams } from "../../server/item-repository";

export async function SearchForm({ searchParams }: { searchParams: Promise<ItemSearchParams> }) {
  await connection();
  const { query = "", category = "", condition = "" } = parseItemFilters(await searchParams);
  const hasFilters = Boolean(query || category || condition);
  const selectClass =
    "h-11 w-full min-w-0 cursor-pointer border-2 border-input bg-card px-2.5 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";
  return (
    <Form key={JSON.stringify([query, category, condition])} action="/" role="search" aria-label="Filtrar itens" className="mb-6 grid grid-cols-2 items-end gap-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
      <label className="col-span-2 space-y-1 text-sm font-medium lg:col-span-1">
        <span>Buscar itens</span>
        <Input name="q" type="search" defaultValue={query} placeholder="Nome, marca ou tag" autoComplete="off" enterKeyHint="search" className="h-11" />
      </label>
      <label className="space-y-1 text-sm font-medium">
        <span>Categoria</span>
        <select name="category" defaultValue={category} className={selectClass}>
          <option value="">Todas</option>
          {Object.entries(ITEM_CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-sm font-medium">
        <span>Condição</span>
        <select name="condition" defaultValue={condition} className={selectClass}>
          <option value="">Todas</option>
          {Object.entries(ITEM_CONDITIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <Button type="submit" variant="accent" className="col-span-2 h-11 lg:col-span-1">Filtrar</Button>
      {hasFilters && (
        <Link href="/" className="col-span-2 flex min-h-11 items-center justify-center px-3 text-sm font-medium underline lg:col-span-1 underline-offset-4 outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50">
          Limpar filtros
        </Link>
      )}
    </Form>
  );
}
