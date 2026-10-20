import Link from "next/link";

export default function ItemNotFound() {
  return (
    <main className="mx-auto max-w-md flex-1 px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Item não encontrado</h1>
      <p className="mt-2 text-muted">Ele pode ter sido removido.</p>
      <Link href="/" className="mt-6 inline-block underline">
        Ver todos os itens
      </Link>
    </main>
  );
}
