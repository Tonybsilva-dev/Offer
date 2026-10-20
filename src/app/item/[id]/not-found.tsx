import Link from "next/link";

export default function ItemNotFound() {
  return (
    <main className="mx-auto max-w-md flex-1 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Item não encontrado</h1>
      <p className="mt-2 text-muted-foreground">Ele pode ter sido removido.</p>
      <Link href="/" className="mt-6 inline-block font-semibold underline underline-offset-4">
        Ver todos os itens
      </Link>
    </main>
  );
}
