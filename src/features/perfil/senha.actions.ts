"use server";

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";

import { senhaFormSchema, type SenhaFormInput } from "./senha.schema";

export type AlterarSenhaResult = { ok: true } | { ok: false; erro: string };

const ERRO_INESPERADO = "Não foi possível alterar a senha. Tente novamente.";

export async function alterarSenha(entrada: SenhaFormInput): Promise<AlterarSenhaResult> {
  const validacao = senhaFormSchema["~standard"].validate(entrada);
  const resultado = await validacao;
  if (resultado.issues) {
    return { ok: false, erro: resultado.issues[0]?.message ?? ERRO_INESPERADO };
  }

  try {
    await apiClient(kyServer, API_ENDPOINTS.auth.senha, undefined, {
      method: "put",
      json: resultado.value,
    });
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, erro: error instanceof Error ? error.message : ERRO_INESPERADO };
  }
}
