"use client";

import { useSenhaForm } from "./use-senha-form";

const CAMPO_CLASS =
  "w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground/40";

export function SenhaForm(): React.ReactNode {
  const { form, enviar, erroServidor, salvo } = useSenhaForm();
  const { register, formState } = form;

  return (
    <form onSubmit={enviar} className="flex w-full max-w-md flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">Alterar senha</h2>
      {(["senhaAtual", "novaSenha"] as const).map((campo) => (
        <div key={campo} className="flex flex-col gap-1.5">
          <label htmlFor={`senha-${campo}`} className="text-sm font-medium">
            {campo === "senhaAtual" ? "Senha atual" : "Nova senha"}
          </label>
          <input
            id={`senha-${campo}`}
            type="password"
            autoComplete={campo === "senhaAtual" ? "current-password" : "new-password"}
            className={CAMPO_CLASS}
            aria-invalid={formState.errors[campo] !== undefined}
            {...register(campo)}
          />
          {formState.errors[campo] ? (
            <p role="alert" className="text-sm text-red-600">
              {formState.errors[campo].message}
            </p>
          ) : null}
        </div>
      ))}
      {erroServidor === null ? null : (
        <p role="alert" className="text-sm text-red-600">
          {erroServidor}
        </p>
      )}
      {salvo ? <output className="text-sm text-green-700">Senha alterada.</output> : null}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {formState.isSubmitting ? "Alterando..." : "Alterar senha"}
      </button>
    </form>
  );
}
