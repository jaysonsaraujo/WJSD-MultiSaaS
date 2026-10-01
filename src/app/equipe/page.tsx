import Image from "next/image";
import { cookies } from "next/headers";
import { AppShell } from "@/features/layout/app-shell";
import { EquipeManager } from "@/features/equipe/equipe-manager";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { membersResponseSchema, type MembersResponse } from "@/shared/schemas/members.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export const instant = false;

export default async function EquipePage(): Promise<React.ReactNode> {
  const organizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;
  const members = organizationId ? await loadMembers(organizationId) : [];
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src="/icons/equipe.png"
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Organização
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Equipe</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Convide pessoas e ajuste papéis da organização selecionada.
            </p>
          </div>
        </header>
        {organizationId ? (
          <EquipeManager organizationId={organizationId} initialMembers={members} />
        ) : (
          <section className="app-development-card">
            <p className="text-sm text-foreground/60">
              Selecione uma organização para gerenciar a equipe.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}

async function loadMembers(organizationId: string): Promise<MembersResponse["membros"]> {
  try {
    return (
      await apiClient(
        kyServer,
        API_ENDPOINTS.organizations.members(organizationId),
        membersResponseSchema,
      )
    ).membros;
  } catch {
    return [];
  }
}
