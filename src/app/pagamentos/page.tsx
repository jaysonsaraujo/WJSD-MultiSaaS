import Image from "next/image";
import { cookies } from "next/headers";
import { AppShell } from "@/features/layout/app-shell";
import { PaymentManager } from "@/features/payments/payment-manager";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { paymentsResponseSchema, type PaymentsResponse } from "@/shared/schemas/payments.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export const instant = false;
export default async function PagamentosPage(): Promise<React.ReactNode> {
  const organizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;
  const payments = organizationId ? await loadPayments(organizationId) : [];
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src="/icons/pagamentos.png"
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Financeiro
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Pagamentos</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Acompanhe cobranças, recebimentos e o ciclo financeiro das assinaturas.
            </p>
          </div>
        </header>
        {organizationId ? (
          <PaymentManager organizationId={organizationId} initialPayments={payments} />
        ) : (
          <section className="app-development-card">
            <p className="text-sm text-foreground/60">
              Selecione uma organização para gerenciar pagamentos.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
async function loadPayments(organizationId: string): Promise<PaymentsResponse["pagamentos"]> {
  try {
    return (
      await apiClient(
        kyServer,
        API_ENDPOINTS.organizations.payments(organizationId),
        paymentsResponseSchema,
      )
    ).pagamentos;
  } catch {
    return [];
  }
}
