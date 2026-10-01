import Image from "next/image";

import { AppShell } from "@/features/layout/app-shell";
import { OrganizationSettings } from "@/features/layout/organization-settings";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { pendingInvitesResponseSchema } from "@/shared/schemas/organizations.schema";

export const instant = false;

export default async function ConfiguracoesPage(): Promise<React.ReactNode> {
  const invites = await apiClient(
    kyServer,
    API_ENDPOINTS.organizations.pendingInvites,
    pendingInvitesResponseSchema,
  );

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src="/icons/configuracoes.png"
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Conta
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Crie organizações e responda convites pendentes da sua conta.
            </p>
          </div>
        </header>
        <OrganizationSettings pendingInvites={invites.convites} />
      </div>
    </AppShell>
  );
}
