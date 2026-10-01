import Image from "next/image";
import { cookies } from "next/headers";
import { AppShell } from "@/features/layout/app-shell";
import { OccurrenceManager } from "@/features/occurrences/occurrence-manager";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { clientsResponseSchema, type ClientsResponse } from "@/shared/schemas/clients.schema";
import { occurrencesResponseSchema, type Occurrence } from "@/shared/schemas/occurrences.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export const instant = false;
export default async function OcorrenciasPage(): Promise<React.ReactNode> {
  const organizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;
  const data = organizationId ? await loadData(organizationId) : null;
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src="/icons/ocorrencias.png"
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Operações
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Ocorrências</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Registre e acompanhe alertas e eventos importantes.
            </p>
          </div>
        </header>
        {data && organizationId ? (
          <OccurrenceManager
            organizationId={organizationId}
            initialOccurrences={data.occurrences}
            clients={data.clients}
          />
        ) : (
          <section className="app-development-card">
            <p className="text-sm text-foreground/60">
              Selecione uma organização para gerenciar ocorrências.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
async function loadData(
  organizationId: string,
): Promise<{ occurrences: Occurrence[]; clients: ClientsResponse["clientes"] }> {
  try {
    const [occurrences, clients] = await Promise.all([
      apiClient(
        kyServer,
        API_ENDPOINTS.organizations.occurrences(organizationId),
        occurrencesResponseSchema,
      ),
      apiClient(
        kyServer,
        API_ENDPOINTS.organizations.clients(organizationId),
        clientsResponseSchema,
      ),
    ]);
    return { occurrences: occurrences.ocorrencias, clients: clients.clientes };
  } catch {
    return { occurrences: [], clients: [] };
  }
}
