"use client";

import { useEffect, useRef, useState } from "react";

type Feedback = "copied" | "failed" | null;

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function announce(next: Feedback) {
    setFeedback(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeedback(null), 3000);
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        // Fechar o menu de compartilhamento não é falha.
        if (!(error instanceof DOMException && error.name === "AbortError")) announce("failed");
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      announce("copied");
    } catch {
      announce("failed");
    }
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={share}
        className="flex min-h-12 w-full items-center justify-center gap-2 border-2 border-foreground bg-card px-5 py-3 text-center font-bold tracking-wide uppercase shadow-hard-sm outline-none transition hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring motion-safe:hover:-translate-x-px motion-safe:hover:-translate-y-px motion-safe:hover:shadow-hard"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        Compartilhar
      </button>
      <p role="status" className="min-h-5 text-center text-sm text-muted-foreground">
        {feedback === "copied" && "Link copiado."}
        {feedback === "failed" && "Não foi possível compartilhar. Copie o endereço da barra do navegador."}
      </p>
    </div>
  );
}
