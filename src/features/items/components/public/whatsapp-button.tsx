export function WhatsAppButton({ href, disabled }: { href: string | null; disabled?: boolean }) {
  if (!href) {
    return <p className="text-sm text-muted-foreground">Contato pelo WhatsApp indisponível no momento.</p>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 border-2 border-foreground bg-[#25D366] px-5 py-3.5 font-bold tracking-wide text-black uppercase shadow-hard transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brightness-95 ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
        <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.3zM12 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.9 9.9 0 1 1 12 21.8zm8.4-18.3A11.9 11.9 0 0 0 1.7 17.8L0 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.5A11.9 11.9 0 0 0 20.4 3.5z" />
      </svg>
      Entrar em contato pelo WhatsApp
    </a>
  );
}
