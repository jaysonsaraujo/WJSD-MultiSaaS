import Image from "next/image";
import { cookies } from "next/headers";
import { AppShell } from "@/features/layout/app-shell";
import { UsageManager } from "@/features/usage/usage-manager";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { modulesResponseSchema, type ModulesResponse } from "@/shared/schemas/modules.schema";
import { usageResponseSchema, type UsageSummary } from "@/shared/schemas/usage.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export const instant = false;

export default async function UsoDeRecursosPage(): Promise<React.ReactNode> {
  const organizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;
  const data = organizationId ? await loadData(organizationId) : null;
  const selectedOrganizationId = organizationId ?? "";
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image className="app-development-icon" src="/icons/uso-recursos.png" alt="" width={56} height={56} />
          <div className="flex flex-col gap-2"><p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">Operações</p><h1 className="text-3xl font-semibold tracking-tight">Uso de Recursos</h1><p className="max-w-2xl text-sm leading-6 text-foreground/60">Registre e acompanhe o consumo real dos módulos por período.</p></div>
        </header>
        {data ? <UsageManager organizationId={selectedOrganizationId} modules={data.modules} initialModuleId={data.modules.length > 0 ? data.modules[0].id : null} initialUsage={data.usage} /> : <section className="app-development-card"><p className="text-sm text-foreground/60">Selecione uma organização para acompanhar o uso de recursos.</p></section>}
      </div>
    </AppShell>
  );
}

async function loadData(organizationId: string): Promise<{ modules: ModulesResponse["modulos"]; usage: UsageSummary[] }> {
  try {
    const modules = (await apiClient(kyServer, API_ENDPOINTS.organizations.modules(organizationId), modulesResponseSchema)).modulos;
    const first = modules[0];
    const usage = first ? (await apiClient(kyServer, API_ENDPOINTS.organizations.moduleUsage(organizationId, first.id), usageResponseSchema)).uso : [];
    return { modules, usage };
  } catch {
    return { modules: [], usage: [] };
  }
}
