import Link from "next/link";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b-2 border-foreground bg-card">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:gap-4">
        <Link href="/" className="flex items-center shrink-0 gap-2 text-lg font-bold tracking-tight uppercase sm:text-xl">
          <span aria-hidden="true" className="size-4 bg-accent outline-2 outline-foreground" />
          Offer
        </Link>
        {children}
      </div>
    </header>
  );
}
