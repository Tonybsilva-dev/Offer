"use client";

import { ChevronDownIcon, ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ItemActionsMenu({ id, title }: { id: string; title: string }) {
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
    <DropdownMenu>
      <DropdownMenuTrigger disabled={pending} aria-label={`Ações do item ${title}`}>
        {pending ? "Excluindo..." : "Ações"}
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLinkItem render={<Link href={`/item/${id}`} target="_blank" />}>
          <ExternalLinkIcon />
          Ver no site
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem render={<Link href={`/admin/itens/${id}`} />}>
          <PencilIcon />
          Editar
        </DropdownMenuLinkItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
