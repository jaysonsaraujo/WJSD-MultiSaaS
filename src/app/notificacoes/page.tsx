import Image from "next/image";

import { AppShell } from "@/features/layout/app-shell";
import { NotificacoesInbox } from "@/features/notificacoes/notificacoes-inbox";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { notificationsResponseSchema } from "@/shared/schemas/notifications.schema";

export const instant = false;

export default async function NotificacoesPage(): Promise<React.ReactNode> {
  const inbox = await apiClient(
    kyServer,
    API_ENDPOINTS.notificacoes.list,
    notificationsResponseSchema,
  );

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src="/icons/notificacoes.png"
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Avisos
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Notificações</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Recusas, atrasos e reembolsos da Cakto — e falhas registradas em pagamentos — aparecem
              aqui para toda a equipe ativa.
            </p>
          </div>
        </header>
        <NotificacoesInbox notificacoes={inbox.notificacoes} />
      </div>
    </AppShell>
  );
}
