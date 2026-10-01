"use server";

import { revalidatePath } from "next/cache";

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";

export async function marcarNotificacaoLida(notificationId: string): Promise<void> {
  await apiClient(kyServer, API_ENDPOINTS.notificacoes.marcarLida(notificationId), undefined, {
    method: "post",
  });
  revalidatePath("/notificacoes");
}
