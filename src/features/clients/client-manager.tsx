"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import { clientResponseSchema, type ClientsResponse } from "@/shared/schemas/clients.schema";
type Client = ClientsResponse["clientes"][number];
export function ClientManager({
  organizationId,
  initialClients,
}: {
  organizationId: string;
  initialClients: Client[];
}): React.ReactNode {
  const [clients, setClients] = useState(initialClients);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (editingId) {
      await updateClient(editingId);
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.clients(organizationId),
        clientResponseSchema,
        { method: "post", json: { nome: name, email: email || null, telefone: phone || null } },
      );
      setClients((current) => [...current, response.cliente]);
      resetForm();
      setMessage("Cliente criado com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar o cliente.");
    } finally {
      setSaving(false);
    }
  }
  function startEditing(client: Client): void {
    setEditingId(client.id);
    setName(client.name);
    setEmail(client.email ?? "");
    setPhone(client.phone ?? "");
    setMessage("");
  }
  async function updateClient(clientId: string): Promise<void> {
    setSaving(true);
    setMessage("");
    try {
      const response = await apiClient(
        kyClient,
        `${API_ENDPOINTS.organizations.clients(organizationId)}/${clientId}`,
        clientResponseSchema,
        { method: "patch", json: { nome: name, email: email || null, telefone: phone || null } },
      );
      setClients((current) =>
        current.map((client) => (client.id === clientId ? response.cliente : client)),
      );
      resetForm();
      setMessage("Cliente atualizado com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar o cliente.");
    } finally {
      setSaving(false);
    }
  }
  async function removeClient(clientId: string): Promise<void> {
    if (!window.confirm("Remover este cliente?")) return;
    setSaving(true);
    try {
      await apiClient(
        kyClient,
        `${API_ENDPOINTS.organizations.clients(organizationId)}/${clientId}`,
        undefined,
        { method: "delete" },
      );
      setClients((current) => current.filter((client) => client.id !== clientId));
      if (editingId === clientId) resetForm();
      setMessage("Cliente removido com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível remover o cliente.");
    } finally {
      setSaving(false);
    }
  }
  function resetForm(): void {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
  }
  return (
    <>
      <form className="app-development-card flex flex-col gap-4" onSubmit={submit}>
        <span className="app-development-status">
          {editingId ? "Editar cliente" : "Novo cliente"}
        </span>
        <h2 className="text-xl font-semibold">
          {editingId ? "Atualizar cliente" : "Cadastrar cliente"}
        </h2>
        <label className="flex flex-col gap-2 text-sm">
          Nome
          <input
            className="login-input w-full px-4 text-sm outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            E-mail
            <input
              className="login-input w-full px-4 text-sm outline-none"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Telefone
            <input
              className="login-input w-full px-4 text-sm outline-none"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
        </div>
        <button
          className="login-primary-button px-4 text-sm font-semibold disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Salvando..." : editingId ? "Atualizar cliente" : "Cadastrar cliente"}
        </button>
        {message ? <output className="text-sm text-foreground/70">{message}</output> : null}
      </form>
      <section className="app-development-card">
        <span className="app-development-status">Dados reais</span>
        <h2 className="mt-3 text-xl font-semibold">Clientes cadastrados</h2>
        {clients.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">
            Nenhum cliente cadastrado nesta organização.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {clients.map((client) => (
              <li className="app-dashboard-module" key={client.id}>
                <strong>{client.name}</strong>
                <small>{client.status === "active" ? "Ativo" : "Inativo"}</small>
                {client.email ? <span>{client.email}</span> : null}
                {client.phone ? <span>{client.phone}</span> : null}
                <span className="mt-2 flex gap-2">
                  <button
                    className="app-secondary-button"
                    type="button"
                    onClick={() => startEditing(client)}
                  >
                    Editar
                  </button>
                  <button
                    className="app-secondary-button"
                    type="button"
                    disabled={saving}
                    onClick={() => void removeClient(client.id)}
                  >
                    Remover
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
