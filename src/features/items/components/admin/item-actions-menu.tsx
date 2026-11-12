"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ChevronDownIcon, EyeIcon, EyeOffIcon, ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ItemActionsMenu({ id, title, hidden }: { id: string; title: string; hidden: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [toggleError, setToggleError] = useState(false);

  async function toggleHidden() {
    const response = await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !hidden }),
    }).catch(() => null);
    if (!response?.ok) return setToggleError(true);
    setToggleError(false);
    router.refresh();
  }

  async function onDelete() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/items/${id}`, { method: "DELETE" }).catch(() => null);
    setPending(false);
    if (!response?.ok) return setError("Não foi possível excluir o item. Tente novamente.");
    setConfirming(false);
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label={`Ações do item ${title}`}>
          Ações
          <ChevronDownIcon data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {!hidden && (
            <DropdownMenuLinkItem render={<Link href={`/item/${id}`} target="_blank" />}>
              <ExternalLinkIcon />
              Ver no site
            </DropdownMenuLinkItem>
          )}
          <DropdownMenuLinkItem render={<Link href={`/admin/itens/${id}`} />}>
            <PencilIcon />
            Editar
          </DropdownMenuLinkItem>
          <DropdownMenuItem onClick={toggleHidden}>
            {hidden ? <EyeIcon /> : <EyeOffIcon />}
            {hidden ? "Exibir na vitrine" : "Ocultar da vitrine"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setError("");
              setConfirming(true);
            }}
          >
            <Trash2Icon />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {toggleError && (
        <p role="alert" className="sr-only">
          Não foi possível alterar a visibilidade do item {title}.
        </p>
      )}

      <Dialog.Root open={confirming} onOpenChange={(open) => !pending && setConfirming(open)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/60" />
          <Dialog.Popup
            role="alertdialog"
            className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 border-2 border-foreground bg-card p-5 shadow-hard outline-none"
          >
            <Dialog.Title className="text-lg font-bold">Excluir item?</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              “{title}” será removido da vitrine e do painel. Essa ação não pode ser desfeita.
            </Dialog.Description>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Dialog.Close render={<Button variant="outline" size="lg" disabled={pending} />}>Cancelar</Dialog.Close>
              <Button variant="destructive" size="lg" disabled={pending} onClick={onDelete}>
                {pending ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
