import Link from "next/link";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b-2 border-foreground bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight uppercase">
          <span aria-hidden="true" className="size-4 bg-accent outline-2 outline-foreground" />
          Offer
        </Link>
        {children}
      </div>
    </header>
  );
}
