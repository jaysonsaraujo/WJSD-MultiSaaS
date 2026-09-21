"use client";

import type { Route } from "next";

import { useLoginForm } from "@/features/auth/use-login-form";

type LoginFormProps = {
  /** Rota tipada para onde ir depois de entrar (typedRoutes valida no build). */
  destino: Route;
};

const CAMPO_CLASS =
  "w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground/40";

/**
 * Formulário de login: UI fina. Estado, chamada e erro vivem no `useLoginForm`.
 */
export function LoginForm({ destino }: LoginFormProps): React.ReactNode {
  const { form, entrar, erroServidor } = useLoginForm(destino);
  const { register, formState } = form;

  return (
    <form onSubmit={entrar} className="flex w-full max-w-sm flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className={CAMPO_CLASS}
          aria-invalid={formState.errors.email !== undefined}
          {...register("email")}
        />
        {formState.errors.email ? (
          <p role="alert" className="text-sm text-red-600">
            {formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-senha" className="text-sm font-medium">
          Senha
        </label>
        <input
          id="login-senha"
          type="password"
          autoComplete="current-password"
          className={CAMPO_CLASS}
          aria-invalid={formState.errors.senha !== undefined}
          {...register("senha")}
        />
        {formState.errors.senha ? (
          <p role="alert" className="text-sm text-red-600">
            {formState.errors.senha.message}
          </p>
        ) : null}
      </div>

      {erroServidor === null ? null : (
        <p role="alert" className="text-sm text-red-600">
          {erroServidor}
        </p>
      )}

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {formState.isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
