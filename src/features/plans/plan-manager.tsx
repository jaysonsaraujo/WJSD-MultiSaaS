"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import { planResponseSchema, type PlansResponse } from "@/shared/schemas/plans.schema";

type Plan = PlansResponse["planos"][number];
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function PlanManager({
  organizationId,
  initialPlans,
}: {
  organizationId: string;
  initialPlans: Plan[];
}): React.ReactNode {
  const [plans, setPlans] = useState(initialPlans);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  async function createPlan(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const parsedPrice = Number(price.replace(",", "."));
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setMessage("Informe um preço válido.");
      return;
    }
    if (editingId) {
      await updatePlan(editingId);
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.plans(organizationId),
        planResponseSchema,
        {
          method: "post",
          json: {
            nome: name,
            slug: slug || undefined,
            descricao: description || null,
            precoCentavos: Math.round(parsedPrice * 100),
            intervalo: interval,
          },
        },
      );
      setPlans((current) => [...current, response.plano]);
      setName("");
      setSlug("");
      setDescription("");
      setPrice("");
      setInterval("month");
      setMessage("Plano criado com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar o plano.");
    } finally {
      setSaving(false);
    }
  }
  function startEditing(plan: Plan): void {
    setEditingId(plan.id);
    setName(plan.name);
    setSlug(plan.slug);
    setDescription(plan.description ?? "");
    setPrice((plan.price_cents / 100).toFixed(2));
    setInterval(plan.billing_interval);
    setMessage("");
  }
  async function updatePlan(planId: string): Promise<void> {
    const parsedPrice = Number(price.replace(",", "."));
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setMessage("Informe um preço válido.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await apiClient(
        kyClient,
        `${API_ENDPOINTS.organizations.plans(organizationId)}/${planId}`,
        planResponseSchema,
        {
          method: "patch",
          json: {
            nome: name,
            slug: slug || undefined,
            descricao: description || null,
            precoCentavos: Math.round(parsedPrice * 100),
            intervalo: interval,
          },
        },
      );
      setPlans((current) => current.map((plan) => (plan.id === planId ? response.plano : plan)));
      resetForm();
      setMessage("Plano atualizado com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar o plano.");
    } finally {
      setSaving(false);
    }
  }
  async function removePlan(planId: string): Promise<void> {
    if (!window.confirm("Remover este plano?")) return;
    setSaving(true);
    setMessage("");
    try {
      await apiClient(
        kyClient,
        `${API_ENDPOINTS.organizations.plans(organizationId)}/${planId}`,
        undefined,
        { method: "delete" },
      );
      setPlans((current) => current.filter((plan) => plan.id !== planId));
      if (editingId === planId) resetForm();
      setMessage("Plano removido com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível remover o plano.");
    } finally {
      setSaving(false);
    }
  }
  function resetForm(): void {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setPrice("");
    setInterval("month");
  }
  return (
    <>
      <form className="app-development-card flex flex-col gap-4" onSubmit={createPlan}>
        <span className="app-development-status">{editingId ? "Editar plano" : "Novo plano"}</span>
        <h2 className="text-xl font-semibold">{editingId ? "Atualizar plano" : "Cadastrar plano"}</h2>
        <label className="flex flex-col gap-2 text-sm">
          Nome
          <input
            className="login-input w-full px-4 text-sm outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Slug{" "}
          <span className="text-xs text-foreground/50">
            Opcional; gerado pelo nome quando vazio.
          </span>
          <input
            className="login-input w-full px-4 text-sm outline-none"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Descrição
          <textarea
            className="login-input min-h-24 w-full px-4 py-3 text-sm outline-none"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Preço
            <input
              className="login-input w-full px-4 text-sm outline-none"
              type="number"
              min="0"
              step="0.01"
              placeholder="R$ 0,00"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Intervalo
            <select
              className="login-input w-full px-4 text-sm outline-none"
              value={interval}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "month" || value === "year") setInterval(value);
              }}
            >
              <option value="month">Mensal</option>
              <option value="year">Anual</option>
            </select>
          </label>
        </div>
        <button
          className="login-primary-button px-4 text-sm font-semibold disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Salvando..." : editingId ? "Atualizar plano" : "Cadastrar plano"}
        </button>
        {message ? <output className="text-sm text-foreground/70">{message}</output> : null}
      </form>
      <section className="app-development-card">
        <span className="app-development-status">Dados reais</span>
        <h2 className="mt-3 text-xl font-semibold">Planos cadastrados</h2>
        {plans.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">
            Nenhum plano cadastrado nesta organização.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => (
              <li className="app-dashboard-module" key={plan.id}>
                <strong>{plan.name}</strong>
                <small>
                  {currency.format(plan.price_cents / 100)} ·{" "}
                  {plan.billing_interval === "month" ? "Mensal" : "Anual"}
                </small>
                {plan.description ? <span>{plan.description}</span> : null}
                <span>{plan.status === "active" ? "Ativo" : "Inativo"}</span>
                <span className="mt-2 flex gap-2">
                  <button className="app-secondary-button" type="button" onClick={() => startEditing(plan)}>
                    Editar
                  </button>
                  <button
                    className="app-secondary-button"
                    type="button"
                    disabled={saving}
                    onClick={() => void removePlan(plan.id)}
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
