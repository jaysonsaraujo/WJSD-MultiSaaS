import type { Route } from "next";

import { LoginForm } from "@/features/auth/login-form";

/** Destino padrão pós-login. Rota canônica: a área autenticada de exemplo. */
const DESTINO_POS_LOGIN: Route = "/perfil";

/**
 * Login. O `proxy.ts` manda pra cá quem não tem cookie de sessão.
 *
 * A rota é um Server Component fino: só compõe. Toda a interação (e a chamada
 * browser-direct que faz o cookie do backend pousar) vive no client component.
 */
export default function LoginPage(): React.ReactNode {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-24">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-foreground/60">
          O backend emite o cookie de sessão; o front nunca decodifica o token.
        </p>
      </header>

      <LoginForm destino={DESTINO_POS_LOGIN} />
    </main>
  );
}
