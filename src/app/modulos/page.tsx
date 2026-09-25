import Image from "next/image";
import { cookies } from "next/headers";
import { AppShell } from "@/features/layout/app-shell";
import { ModuleManager } from "@/features/modules/module-manager";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { modulesResponseSchema, type ModulesResponse } from "@/shared/schemas/modules.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export const instant = false;
export default async function ModulosPage(): Promise<React.ReactNode> {
  const organizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;
  const modules = organizationId ? await loadModules(organizationId) : [];
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src="/icons/modulos.png"
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Configuração
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Módulos</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Ative e configure os módulos disponíveis para cada produto e organização.
            </p>
          </div>
        </header>
        {organizationId ? (
          <ModuleManager organizationId={organizationId} initialModules={modules} />
        ) : (
          <section className="app-development-card">
            <p className="text-sm text-foreground/60">
              Selecione uma organização para gerenciar módulos.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}

async function loadModules(organizationId: string): Promise<ModulesResponse["modulos"]> {
  try {
    return (
      await apiClient(
        kyServer,
        API_ENDPOINTS.organizations.modules(organizationId),
        modulesResponseSchema,
      )
    ).modulos;
  } catch {
    return [];
  }
}
