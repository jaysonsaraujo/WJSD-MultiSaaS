"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import {
  membersResponseSchema,
  inviteRoles,
  type InviteRole,
  type OrganizationMember,
} from "@/shared/schemas/members.schema";

const ROLE_LABEL = {
  owner: "Proprietário",
  admin: "Admin",
  member: "Membro",
  viewer: "Visualizador",
} as const;

const STATUS_LABEL = {
  active: "Ativo",
  invited: "Convidado",
  disabled: "Desativado",
} as const;

function isInviteRole(value: string): value is InviteRole {
  return inviteRoles.some((role) => role === value);
}

/**
 * Lista, convite, papel e remoção de membros da organização selecionada.
 *
 * @param organizationId - Organização ativa no cookie de contexto.
 * @param initialMembers - Membros já lidos no RSC.
 */
export function EquipeManager({
  organizationId,
  initialMembers,
}: {
  organizationId: string;
  initialMembers: OrganizationMember[];
}): React.ReactNode {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<InviteRole>("member");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function reloadMembers(): Promise<void> {
    const response = await apiClient(
      kyClient,
      API_ENDPOINTS.organizations.members(organizationId),
      membersResponseSchema,
    );
    setMembers(response.membros);
  }

  async function invite(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await apiClient(kyClient, API_ENDPOINTS.organizations.invites(organizationId), undefined, {
        method: "post",
        json: { email, papel },
      });
      await reloadMembers();
      setEmail("");
      setPapel("member");
      setMessage("Convite enviado.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar o convite.");
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(memberId: string, nextRole: InviteRole): Promise<void> {
    setSaving(true);
    setMessage("");
    try {
      await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.member(organizationId, memberId),
        undefined,
        { method: "patch", json: { papel: nextRole } },
      );
      setMembers((current) =>
        current.map((member) =>
          member.user_id === memberId ? { ...member, role: nextRole } : member,
        ),
      );
      setMessage("Papel atualizado.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar o papel.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(memberId: string): Promise<void> {
    if (!window.confirm("Remover este membro da organização?")) return;
    setSaving(true);
    setMessage("");
    try {
      await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.member(organizationId, memberId),
        undefined,
        { method: "delete" },
      );
      setMembers((current) => current.filter((member) => member.user_id !== memberId));
      setMessage("Membro removido.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível remover o membro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form className="app-development-card flex flex-col gap-4" onSubmit={invite}>
        <span className="app-development-status">Novo convite</span>
        <h2 className="text-xl font-semibold">Convidar pessoa</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            E-mail
            <input
              className="login-input w-full px-4 text-sm outline-none"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Papel
            <select
              className="login-input w-full px-4 text-sm outline-none"
              value={papel}
              onChange={(event) => {
                if (isInviteRole(event.target.value)) setPapel(event.target.value);
              }}
            >
              {inviteRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="login-primary-button px-4 text-sm font-semibold disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Enviando..." : "Enviar convite"}
        </button>
        {message ? <output className="text-sm text-foreground/70">{message}</output> : null}
      </form>
      <section className="app-development-card">
        <span className="app-development-status">Dados reais</span>
        <h2 className="mt-3 text-xl font-semibold">Membros</h2>
        {members.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">
            Nenhum membro listado nesta organização.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {members.map((member) => (
              <li className="app-dashboard-module" key={member.user_id}>
                <strong>{member.name}</strong>
                <small>
                  {ROLE_LABEL[member.role]} · {STATUS_LABEL[member.status]}
                </small>
                <span>{member.email}</span>
                {member.role === "owner" ? null : (
                  <span className="mt-2 flex flex-wrap gap-2">
                    <label className="flex flex-col gap-1 text-xs">
                      Papel
                      <select
                        className="login-input px-3 text-sm outline-none"
                        value={member.role}
                        disabled={saving}
                        onChange={(event) => {
                          if (isInviteRole(event.target.value)) {
                            void changeRole(member.user_id, event.target.value);
                          }
                        }}
                      >
                        {inviteRoles.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABEL[role]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="app-secondary-button"
                      type="button"
                      disabled={saving}
                      onClick={() => void removeMember(member.user_id)}
                    >
                      Remover
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
