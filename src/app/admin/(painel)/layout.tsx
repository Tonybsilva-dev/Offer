import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireAdmin } from "@/features/auth/server/session";
import { SiteHeader } from "@/shared/ui/site-header";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <SiteHeader>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="font-semibold hover:underline">Itens</Link>
          <Button size="sm" variant="accent" nativeButton={false} render={<Link href="/admin/itens/novo" />}>
            Novo item
          </Button>
          <LogoutButton />
        </nav>
      </SiteHeader>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
          <AdminGuard>{children}</AdminGuard>
        </Suspense>
      </main>
    </>
  );
}
