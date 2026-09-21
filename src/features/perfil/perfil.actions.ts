"use server";

import { revalidatePath } from "next/cache";

import { parsePerfilForm, type PerfilFormInput } from "@/features/perfil/perfil.schema";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";

/**
 * Resultado da mutação, no formato que o `useActionState` do React 19 consome.
 * `erro` carrega a mensagem que o backend devolveu — texto já seguro pra UI.
 */
export type SalvarPerfilResult = { ok: true } | { ok: false; erro: string };

/** Texto de último recurso: falha sem `Error` não tem mensagem própria pra mostrar. */
const ERRO_INESPERADO = "Não foi possível salvar. Tente novamente.";

/**
 * Salva o perfil do usuário autenticado.
 *
 * Revalida no servidor mesmo o formulário já tendo validado no client: validação
 * de client é UX, não fronteira de segurança. Depois do sucesso, `revalidatePath`
 * repuxa o RSC — é assim que o dado volta fresco, já que o repo não tem cache.
 *
 * @param entrada - Campos editáveis vindos do formulário.
 * @returns `{ ok: true }` ou `{ ok: false, erro }` com a mensagem do backend.
 */
export async function salvarPerfil(entrada: PerfilFormInput): Promise<SalvarPerfilResult> {
  try {
    const validado = parsePerfilForm(entrada);
    // Sem schema: o contrato deste endpoint não devolve `data`, só o envelope.
    await apiClient(kyServer, API_ENDPOINTS.perfil.me, undefined, {
      method: "put",
      json: validado,
    });
  } catch (error: unknown) {
    // O `apiClient` já converteu a falha na mensagem segura do backend (ou no
    // texto de conexão). Repassar aqui é entregar feedback, não engolir erro.
    return { ok: false, erro: error instanceof Error ? error.message : ERRO_INESPERADO };
  }

  revalidatePath("/perfil");
  return { ok: true };
}
