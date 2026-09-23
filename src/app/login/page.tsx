import type { Route } from "next";

import { LoginForm } from "@/features/auth/login-form";

/** Destino padrão pós-login: o Dashboard da área autenticada. */
const DESTINO_POS_LOGIN: Route = "/dashboard";

/**
 * Login. O `proxy.ts` manda pra cá quem não tem cookie de sessão.
 *
 * A rota é um Server Component fino: só compõe. Toda a interação (e a chamada
 * browser-direct que faz o cookie do backend pousar) vive no client component.
 */
export default function LoginPage(): React.ReactNode {
  return (
    <main className="login-shell flex flex-col px-6 py-8 sm:px-10">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="login-brand-mark" aria-hidden="true">
            W
          </span>
          <div>
            <p className="login-heading text-sm font-semibold tracking-wide">WJSD</p>
            <p className="login-muted text-xs">Sistemas e Tecnologia</p>
          </div>
        </div>
        <p className="login-muted hidden text-sm sm:block">Ambiente seguro</p>
      </header>

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
        <div className="mb-8 text-center">
          <p className="login-eyebrow mb-4 text-sm font-medium tracking-[0.18em] uppercase">
            Bem-vindo de volta
          </p>
          <h1 className="login-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Acesse seu MultiSaaS
          </h1>
          <p className="login-muted mx-auto mt-3 max-w-sm text-sm leading-6">
            Sistemas que ajudam pessoas a ajudar pessoas.
          </p>
        </div>

        <div className="login-card p-6 sm:p-8">
          <LoginForm destino={DESTINO_POS_LOGIN} />
        </div>

        <p className="login-muted mt-6 text-center text-xs leading-5">
          Seu acesso é protegido por sessão segura e conexão criptografada.
        </p>
      </section>

      <footer className="login-muted mx-auto w-full max-w-6xl text-center text-xs">
        WJSD Sistemas e Tecnologia
      </footer>
    </main>
  );
}
