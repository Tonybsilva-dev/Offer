import Form from "next/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm() {
  return (
    <Form action="/" className="flex w-full max-w-sm gap-2">
      <Input name="q" type="search" placeholder="Buscar itens" aria-label="Buscar itens" />
      <Button type="submit" variant="accent">
        Buscar
      </Button>
    </Form>
  );
}
