"use client";

import type { Route } from "next";

import { useLoginForm } from "@/features/auth/use-login-form";

type LoginFormProps = {
  /** Rota tipada para onde ir depois de entrar (typedRoutes valida no build). */
  destino: Route;
};

const CAMPO_CLASS = "login-input w-full px-4 text-sm outline-none";

/**
 * Formulário de login: UI fina. Estado, chamada e erro vivem no `useLoginForm`.
 */
export function LoginForm({ destino }: LoginFormProps): React.ReactNode {
  const { form, entrar, erroServidor } = useLoginForm(destino);
  const { register, formState } = form;

  return (
    <form onSubmit={entrar} className="flex w-full flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="login-email" className="login-label text-sm font-medium">
          E-mail
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className={CAMPO_CLASS}
          aria-invalid={formState.errors.email !== undefined}
          aria-describedby={formState.errors.email ? "login-email-error" : undefined}
          {...register("email")}
        />
        {formState.errors.email ? (
          <p id="login-email-error" role="alert" className="text-sm text-red-400">
            {formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="login-senha" className="login-label text-sm font-medium">
          Senha
        </label>
        <input
          id="login-senha"
          type="password"
          autoComplete="current-password"
          className={CAMPO_CLASS}
          aria-invalid={formState.errors.senha !== undefined}
          aria-describedby={formState.errors.senha ? "login-senha-error" : undefined}
          {...register("senha")}
        />
        {formState.errors.senha ? (
          <p id="login-senha-error" role="alert" className="text-sm text-red-400">
            {formState.errors.senha.message}
          </p>
        ) : null}
      </div>

      {erroServidor === null ? null : (
        <p role="alert" className="text-sm text-red-400">
          {erroServidor}
        </p>
      )}

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="login-primary-button mt-2 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {formState.isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
