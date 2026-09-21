"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

import { loginSchema, type LoginInput } from "@/features/auth/login.schema";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";

type UseLoginForm = {
  form: UseFormReturn<LoginInput>;
  entrar: (evento: React.FormEvent<HTMLFormElement>) => void;
  erroServidor: string | null;
};

/** Texto de último recurso: falha sem `Error` não tem mensagem própria pra mostrar. */
const ERRO_INESPERADO = "Não foi possível entrar. Tente novamente.";

/**
 * Estado e submit do login.
 *
 * Esta é a ÚNICA família de chamada que sai do browser direto pro backend
 * (`kyClient`), e o motivo é o cookie: o `Set-Cookie` HttpOnly da resposta só
 * pousa se a requisição partir do browser. Login feito por Server Action
 * perderia o cookie no caminho. Leitura de dado, ao contrário, é sempre RSC.
 *
 * Depois do sucesso, `router.refresh()` repuxa a árvore de servidor já com o
 * cookie: é o que faz o `proxy.ts` parar de redirecionar pro login.
 *
 * @param destino - Rota tipada para onde ir depois de entrar (typedRoutes).
 * @returns Form do RHF, handler de submit e o erro da última tentativa.
 */
export function useLoginForm(destino: Route): UseLoginForm {
  const router = useRouter();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: valibotResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  const entrar = form.handleSubmit(async (credenciais) => {
    setErroServidor(null);
    try {
      // Sem schema: a identidade vem do cookie, o contrato não devolve `data`.
      await apiClient(kyClient, API_ENDPOINTS.auth.login, undefined, {
        method: "post",
        json: credenciais,
      });
    } catch (error: unknown) {
      setErroServidor(error instanceof Error ? error.message : ERRO_INESPERADO);
      return;
    }
    router.replace(destino);
    router.refresh();
  });

  return { form, entrar, erroServidor };
}
