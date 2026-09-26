import Image from "next/image";
import { cookies } from "next/headers";

import { AppShell } from "@/features/layout/app-shell";
import { PlanManager } from "@/features/plans/plan-manager";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { plansResponseSchema, type PlansResponse } from "@/shared/schemas/plans.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export const instant = false;

export default async function PlanosPage(): Promise<React.ReactNode> {
  const organizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;
  const plans = organizationId ? await loadPlans(organizationId) : [];
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src="/icons/planos.png"
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Assinaturas
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Planos</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Configure os planos de assinatura oferecidos pela organização selecionada.
            </p>
          </div>
        </header>
        {organizationId ? (
          <PlanManager organizationId={organizationId} initialPlans={plans} />
        ) : (
          <section className="app-development-card">
            <p className="text-sm text-foreground/60">
              Selecione uma organização para gerenciar planos.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
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
