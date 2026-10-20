import { ItemForm } from "@/features/items/components/admin/item-form";

export default function NewItemPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Novo item</h1>
      <ItemForm />
    </section>
  );
}
