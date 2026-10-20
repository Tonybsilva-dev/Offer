import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight uppercase">
          <span aria-hidden="true" className="size-5 bg-accent outline-2 outline-foreground" />
          Offer
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
