import Form from "next/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm() {
  return (
    <Form action="/" className="flex min-w-0 flex-1 gap-2 sm:max-w-sm">
      <Input name="q" type="search" placeholder="Buscar itens" aria-label="Buscar itens" />
      <Button type="submit" variant="accent">
        Buscar
      </Button>
    </Form>
  );
}
