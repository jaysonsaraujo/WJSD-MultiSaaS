import Image from "next/image";
import { cookies } from "next/headers";
import { AppShell } from "@/features/layout/app-shell";
import { ClientManager } from "@/features/clients/client-manager";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { clientsResponseSchema, type ClientsResponse } from "@/shared/schemas/clients.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export const instant = false;
export default async function ClientesPage(): Promise<React.ReactNode> {
  const organizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;
  const clients = organizationId ? await loadClients(organizationId) : [];
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src="/icons/clientes.png"
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Relacionamento
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Clientes</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Gerencie os clientes da organização selecionada.
            </p>
          </div>
        </header>
        {organizationId ? (
          <ClientManager organizationId={organizationId} initialClients={clients} />
        ) : (
          <section className="app-development-card">
            <p className="text-sm text-foreground/60">
              Selecione uma organização para gerenciar clientes.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}

async function loadClients(organizationId: string): Promise<ClientsResponse["clientes"]> {
  try {
    return (
      await apiClient(
        kyServer,
        API_ENDPOINTS.organizations.clients(organizationId),
        clientsResponseSchema,
      )
    ).clientes;
  } catch {
    return [];
  }
}
