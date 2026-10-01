"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { persistOrganizationSelection } from "@/features/layout/organization.actions";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import {
  inviteResponseActions,
  organizationCreateResponseSchema,
  type InviteResponseAction,
  type PendingInvite,
} from "@/shared/schemas/organizations.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

const ERRO_CRIAR = "Não foi possível criar a organização.";
const ERRO_CONVITE = "Não foi possível responder o convite.";
const INVITE_ACTION_LABEL = {
  aceitar: "Aceitar",
  recusar: "Recusar",
} as const;

/**
 * Cria organização e responde convites pendentes da conta autenticada.
 *
 * @param pendingInvites - GET /api/v1/convites.
 */
export function OrganizationSettings({
  pendingInvites,
}: {
  pendingInvites: PendingInvite[];
}): React.ReactNode {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function createOrganization(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const trimmedSlug = slug.trim();
    try {
      const response = await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.list,
        organizationCreateResponseSchema,
        {
          method: "post",
          json:
            trimmedSlug === "" ? { nome: nome.trim() } : { nome: nome.trim(), slug: trimmedSlug },
        },
      );
      window.localStorage.setItem(ORGANIZATION_COOKIE, response.organizacao.id);
      await persistOrganizationSelection(response.organizacao.id);
      setNome("");
      setSlug("");
      router.refresh();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : ERRO_CRIAR);
    } finally {
      setSaving(false);
    }
  }

  async function respondInvite(
    organizationId: string,
    action: InviteResponseAction,
  ): Promise<void> {
    if (action === "recusar" && !window.confirm("Recusar este convite?")) return;
    setSaving(true);
    setMessage("");
    try {
      await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.inviteResponse(organizationId, action),
        undefined,
        { method: "post" },
      );
      if (action === "aceitar") {
        window.localStorage.setItem(ORGANIZATION_COOKIE, organizationId);
        await persistOrganizationSelection(organizationId);
      }
      router.refresh();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : ERRO_CONVITE);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form className="app-development-card flex flex-col gap-4" onSubmit={createOrganization}>
        <span className="app-development-status">Nova organização</span>
        <h2 className="text-xl font-semibold">Criar organização</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Nome
            <input
              className="login-input w-full px-4 text-sm outline-none"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Identificador
            <input
              className="login-input w-full px-4 text-sm outline-none"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              maxLength={48}
            />
          </label>
        </div>
        <p className="text-sm text-foreground/60">Identificador é opcional.</p>
        <button
          className="login-primary-button px-4 text-sm font-semibold disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Salvando..." : "Criar organização"}
        </button>
        {message ? <output className="text-sm text-foreground/70">{message}</output> : null}
      </form>
      <section className="app-development-card">
        <span className="app-development-status">Convites</span>
        <h2 className="mt-3 text-xl font-semibold">Pendentes</h2>
        {pendingInvites.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">Nenhum convite pendente.</p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {pendingInvites.map((invite) => (
              <li className="app-dashboard-module" key={invite.organization_id}>
                <strong>{invite.organization_name}</strong>
                <span className="mt-2 flex flex-wrap gap-2">
                  {inviteResponseActions.map((action) => (
                    <button
                      className="app-secondary-button"
                      type="button"
                      disabled={saving}
                      key={action}
                      onClick={() => void respondInvite(invite.organization_id, action)}
                    >
                      {INVITE_ACTION_LABEL[action]}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
