"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import type { ModulesResponse } from "@/shared/schemas/modules.schema";
import {
  usageEventResponseSchema,
  usageResponseSchema,
  type UsageSummary,
} from "@/shared/schemas/usage.schema";

type Module = ModulesResponse["modulos"][number];

export function UsageManager({ organizationId, modules, initialModuleId, initialUsage }: {
  organizationId: string;
  modules: Module[];
  initialModuleId: string | null;
  initialUsage: UsageSummary[];
}): React.ReactNode {
  const [moduleId, setModuleId] = useState(initialModuleId ?? (modules.length > 0 ? modules[0].id : ""));
  const [usage, setUsage] = useState(initialUsage);
  const [metricKey, setMetricKey] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function selectModule(nextModuleId: string): Promise<void> {
    setModuleId(nextModuleId);
    if (!nextModuleId) { setUsage([]); return; }
    try {
      const response = await apiClient(kyClient, API_ENDPOINTS.organizations.moduleUsage(organizationId, nextModuleId), usageResponseSchema);
      setUsage(response.uso);
      setMessage("");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar o uso.");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!moduleId || !metricKey.trim() || !periodStart || !periodEnd || Number(quantity) <= 0) {
      setMessage("Preencha módulo, métrica, quantidade e período válido.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await apiClient(kyClient, API_ENDPOINTS.organizations.usageEvents(organizationId), usageEventResponseSchema, {
        method: "post",
        json: {
          module_id: moduleId,
          plan_id: null,
          metric_key: metricKey.trim(),
          quantity: Number(quantity),
          period_start: periodStart,
          period_end: periodEnd,
          source: source.trim() || null,
        },
      });
      const refreshed = await apiClient(kyClient, API_ENDPOINTS.organizations.moduleUsage(organizationId, moduleId), usageResponseSchema);
      setUsage(refreshed.uso);
      setMetricKey("");
      setQuantity("1");
      setSource("");
      setMessage("Uso registrado com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível registrar o uso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="app-development-card">
        <span className="app-development-status">Registro real</span>
        <h2 className="mt-3 text-xl font-semibold">Registrar uso</h2>
        <form className="mt-4 grid gap-4" onSubmit={submit}>
          <label className="flex flex-col gap-2 text-sm">Módulo
            <select className="login-input w-full px-3 text-sm outline-none" value={moduleId} onChange={(event) => void selectModule(event.target.value)} required>
              <option value="">Selecione um módulo</option>
              {modules.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">Métrica<input className="login-input px-3 text-sm outline-none" value={metricKey} onChange={(event) => setMetricKey(event.target.value)} placeholder="ex.: usuários" required /></label>
            <label className="flex flex-col gap-2 text-sm">Quantidade<input className="login-input px-3 text-sm outline-none" type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
            <label className="flex flex-col gap-2 text-sm">Início do período<input className="login-input px-3 text-sm outline-none" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} required /></label>
            <label className="flex flex-col gap-2 text-sm">Fim do período<input className="login-input px-3 text-sm outline-none" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} required /></label>
          </div>
          <label className="flex flex-col gap-2 text-sm">Fonte (opcional)<input className="login-input px-3 text-sm outline-none" value={source} onChange={(event) => setSource(event.target.value)} placeholder="ex.: importação" /></label>
          <button className="login-primary-button px-4 text-sm font-semibold disabled:opacity-60" disabled={saving || !moduleId} type="submit">{saving ? "Registrando..." : "Registrar uso"}</button>
          {message ? <output className="text-sm text-foreground/70">{message}</output> : null}
        </form>
      </section>
      <section className="app-development-card">
        <span className="app-development-status">Dados agregados</span>
        <h2 className="mt-3 text-xl font-semibold">Consumo por período</h2>
        {usage.length === 0 ? <p className="mt-2 text-sm text-foreground/60">Nenhum consumo registrado para este módulo.</p> : <ul className="mt-5 grid gap-3 sm:grid-cols-2">{usage.map((item) => <li className="app-dashboard-module" key={`${item.metric_key}-${item.period_start}-${item.period_end}`}><strong>{item.metric_key}</strong><span>{item.total_quantity} {item.unit ?? "unidades"}</span><small>{item.period_start} a {item.period_end}</small></li>)}</ul>}
      </section>
    </>
  );
}
