import Image from "next/image";
import { cookies } from "next/headers";
import { AppShell } from "@/features/layout/app-shell";
import { ModuleManager } from "@/features/modules/module-manager";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { modulesResponseSchema, type ModulesResponse } from "@/shared/schemas/modules.schema";
import { productsResponseSchema, type ProductsResponse } from "@/shared/schemas/products.schema";
import { plansResponseSchema, type PlansResponse } from "@/shared/schemas/plans.schema";
import {
  moduleAssociationsResponseSchema,
  type ModuleAssociations,
} from "@/shared/schemas/module-associations.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export const instant = false;
export default async function ModulosPage(): Promise<React.ReactNode> {
  const organizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;
  const data = organizationId ? await loadModuleData(organizationId) : null;
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
        {organizationId && data ? (
          <ModuleManager
            organizationId={organizationId}
            initialModules={data.modules}
            products={data.products}
            plans={data.plans}
            initialAssociations={data.associations}
          />
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

async function loadModuleData(organizationId: string): Promise<{
  modules: ModulesResponse["modulos"];
  products: ProductsResponse["produtos"];
  plans: PlansResponse["planos"];
  associations: Record<string, ModuleAssociations>;
}> {
  const [modules, products, plans] = await Promise.all([
    loadModules(organizationId),
    loadProducts(organizationId),
    loadPlans(organizationId),
  ]);
  const associations = Object.fromEntries(
    await Promise.all(
      modules.map(
        async (module) => [module.id, await loadAssociations(organizationId, module.id)] as const,
      ),
    ),
  );
  return { modules, products, plans, associations };
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

async function loadProducts(organizationId: string): Promise<ProductsResponse["produtos"]> {
  try {
    return (
      await apiClient(
        kyServer,
        API_ENDPOINTS.organizations.products(organizationId),
        productsResponseSchema,
      )
    ).produtos;
  } catch {
    return [];
  }
}

async function loadPlans(organizationId: string): Promise<PlansResponse["planos"]> {
  try {
    return (
      await apiClient(
        kyServer,
        API_ENDPOINTS.organizations.plans(organizationId),
        plansResponseSchema,
      )
    ).planos;
  } catch {
    return [];
  }
}

async function loadAssociations(
  organizationId: string,
  moduleId: string,
): Promise<ModuleAssociations> {
  try {
    return await apiClient(
      kyServer,
      API_ENDPOINTS.organizations.moduleAssociations(organizationId, moduleId),
      moduleAssociationsResponseSchema,
    );
  } catch {
    return { produtos: [], planos: [] };
  }
}
