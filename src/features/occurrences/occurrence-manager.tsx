"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import { occurrenceResponseSchema, type Occurrence } from "@/shared/schemas/occurrences.schema";
import type { ClientsResponse } from "@/shared/schemas/clients.schema";

type Client = ClientsResponse["clientes"][number];
const priorities = ["low", "medium", "high", "urgent"] as const;
const statuses = ["open", "in_progress", "resolved", "canceled"] as const;
const priorityLabel: Record<(typeof priorities)[number], string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};
const statusLabel: Record<(typeof statuses)[number], string> = {
  open: "Aberta",
  in_progress: "Em andamento",
  resolved: "Resolvida",
  canceled: "Cancelada",
};
function validPriority(value: string): value is (typeof priorities)[number] {
  return priorities.some((item) => item === value);
}
function validStatus(value: string): value is (typeof statuses)[number] {
  return statuses.some((item) => item === value);
}

export function OccurrenceManager({
  organizationId,
  initialOccurrences,
  clients,
}: {
  organizationId: string;
  initialOccurrences: Occurrence[];
  clients: Client[];
}): React.ReactNode {
  const [items, setItems] = useState(initialOccurrences);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [priority, setPriority] = useState<(typeof priorities)[number]>("medium");
  const [status, setStatus] = useState<(typeof statuses)[number]>("open");
  const [dueAt, setDueAt] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const filtered = items.filter(
    (item) =>
      (!filterStatus || item.status === filterStatus) &&
      (!filterPriority || item.priority === filterPriority),
  );
  function reset(): void {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setClientId("");
    setPriority("medium");
    setStatus("open");
    setDueAt("");
  }
  function edit(item: Occurrence): void {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setClientId(item.client_id ?? "");
    if (validPriority(item.priority)) setPriority(item.priority);
    if (validStatus(item.status)) setStatus(item.status);
    setDueAt(item.due_at ? item.due_at.slice(0, 16) : "");
    setMessage("");
  }
  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const path = editingId
        ? `${API_ENDPOINTS.organizations.occurrences(organizationId)}/${editingId}`
        : API_ENDPOINTS.organizations.occurrences(organizationId);
      const response = await apiClient(kyClient, path, occurrenceResponseSchema, {
        method: editingId ? "patch" : "post",
        json: {
          titulo: title.trim(),
          descricao: description.trim() || null,
          cliente_id: clientId || null,
          prioridade: priority,
          ...(editingId ? { status } : {}),
          vencimento_em: dueAt ? new Date(dueAt).toISOString() : null,
        },
      });
      setItems((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? response.ocorrencia : item))
          : [response.ocorrencia, ...current],
      );
      reset();
      setMessage(editingId ? "Ocorrência atualizada." : "Ocorrência criada.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar a ocorrência.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(id: string): Promise<void> {
    if (!window.confirm("Remover esta ocorrência?")) return;
    setSaving(true);
    try {
      await apiClient(
        kyClient,
        `${API_ENDPOINTS.organizations.occurrences(organizationId)}/${id}`,
        undefined,
        { method: "delete" },
      );
      setItems((current) => current.filter((item) => item.id !== id));
      setMessage("Ocorrência removida.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível remover.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <form className="app-development-card flex flex-col gap-4" onSubmit={submit}>
        <span className="app-development-status">
          {editingId ? "Editar ocorrência" : "Nova ocorrência"}
        </span>
        <h2 className="text-xl font-semibold">
          {editingId ? "Atualizar ocorrência" : "Registrar ocorrência"}
        </h2>
        <input
          className="login-input w-full px-4 text-sm outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          required
        />
        <textarea
          className="login-input min-h-24 w-full px-4 py-3 text-sm outline-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Cliente (opcional)
            <select
              className="login-input px-3 text-sm outline-none"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Sem cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Prazo
            <input
              className="login-input px-3 text-sm outline-none"
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Prioridade
            <select
              className="login-input px-3 text-sm outline-none"
              value={priority}
              onChange={(e) => {
                if (validPriority(e.target.value)) setPriority(e.target.value);
              }}
            >
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {priorityLabel[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Status
            <select
              className="login-input px-3 text-sm outline-none"
              value={status}
              onChange={(e) => {
                if (validStatus(e.target.value)) setStatus(e.target.value);
              }}
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {statusLabel[item]}
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
          {saving ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
        </button>
        {message ? <output className="text-sm text-foreground/70">{message}</output> : null}
      </form>
      <section className="app-development-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="app-development-status">Dados reais</span>
            <h2 className="mt-3 text-xl font-semibold">Ocorrências</h2>
          </div>
          <div className="flex gap-2">
            <select
              className="login-input px-3 text-sm outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {statusLabel[item]}
                </option>
              ))}
            </select>
            <select
              className="login-input px-3 text-sm outline-none"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">Todas prioridades</option>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {priorityLabel[item]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">Nenhuma ocorrência encontrada.</p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => (
              <li className="app-dashboard-module" key={item.id}>
                <strong>{item.title}</strong>
                <small>
                  {priorityLabel[validPriority(item.priority) ? item.priority : "medium"]} ·{" "}
                  {statusLabel[validStatus(item.status) ? item.status : "open"]}
                </small>
                {item.description ? <span>{item.description}</span> : null}
                {item.client_id ? (
                  <span>
                    Cliente:{" "}
                    {clients.find((client) => client.id === item.client_id)?.name ?? item.client_id}
                  </span>
                ) : null}
                <span className="mt-2 flex gap-2">
                  <button className="app-secondary-button" type="button" onClick={() => edit(item)}>
                    Editar
                  </button>
                  <button
                    className="app-secondary-button"
                    type="button"
                    disabled={saving}
                    onClick={() => void remove(item.id)}
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
