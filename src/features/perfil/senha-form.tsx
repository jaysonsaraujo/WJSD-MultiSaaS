"use client";

import { useSenhaForm } from "./use-senha-form";

const CAMPO_CLASS =
  "w-full rounded-md border border-violet-200/70 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-400";

export function SenhaForm(): React.ReactNode {
  const { form, enviar, erroServidor, salvo } = useSenhaForm();
  const { register, formState } = form;

  return (
    <form
      onSubmit={enviar}
      className="profile-password-panel flex w-full flex-col gap-4"
      noValidate
    >
      <div>
        <h2 className="text-sm font-semibold">Alterar senha</h2>
        <p className="text-xs text-foreground/60">
          Informe a senha atual e defina uma nova senha para sua conta.
        </p>
      </div>
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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha-repetirSenha" className="text-sm font-medium">
          Repetir nova senha
        </label>
        <input
          id="senha-repetirSenha"
          type="password"
          autoComplete="new-password"
          className={CAMPO_CLASS}
          aria-invalid={formState.errors.repetirSenha !== undefined}
          {...register("repetirSenha")}
        />
        {formState.errors.repetirSenha ? (
          <p role="alert" className="text-sm text-red-600">
            {formState.errors.repetirSenha.message}
          </p>
        ) : null}
      </div>
      {erroServidor === null ? null : (
        <p role="alert" className="text-sm text-red-600">
          {erroServidor}
        </p>
      )}
      {salvo ? <output className="text-sm text-green-700">Senha alterada.</output> : null}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="profile-secondary-button self-start px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {formState.isSubmitting ? "Alterando..." : "Alterar senha"}
      </button>
    </form>
  );
}
