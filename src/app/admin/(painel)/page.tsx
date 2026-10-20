import { Suspense } from "react";
import { AdminItemTable } from "@/features/items/components/admin/admin-item-table";

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Itens</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando itens...</p>}>
        <AdminItemTable />
      </Suspense>
    </section>
  );
}
