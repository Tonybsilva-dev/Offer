"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteItemButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!confirm(`Excluir "${title}"? Essa ação não pode ser desfeita.`)) return;
    setPending(true);
    const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) return alert("Não foi possível excluir o item.");
    router.refresh();
  }

  return (
    <button type="button" onClick={onDelete} disabled={pending} className="text-red-600 hover:underline disabled:opacity-50">
      {pending ? "Excluindo..." : "Excluir"}
    </button>
  );
}
