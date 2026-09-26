"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import {
  moduleLimitsSaveResponseSchema,
  type ModuleLimit,
} from "@/shared/schemas/module-limits.schema";
import type { PlansResponse } from "@/shared/schemas/plans.schema";

type Plan = PlansResponse["planos"][number];
type LimitDraft = Pick<ModuleLimit, "plan_id" | "metric_key" | "limit_value" | "unit">;

export function ModuleLimits({
  organizationId,
  moduleId,
  plans,
  initialLimits,
}: {
  organizationId: string;
  moduleId: string;
  plans: Plan[];
  initialLimits: ModuleLimit[];
}): React.ReactNode {
  const [limits, setLimits] = useState<LimitDraft[]>(() => initialLimits.map(toDraft));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update(index: number, field: keyof LimitDraft, value: string): void {
    setLimits((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (field === "limit_value") return { ...item, limit_value: Number(value) };
        if (field === "plan_id") return { ...item, plan_id: value || null };
        return { ...item, [field]: value };
      }),
    );
  }

  async function save(): Promise<void> {
    if (limits.some((item) => !item.metric_key.trim() || !item.unit.trim() || !Number.isFinite(item.limit_value) || item.limit_value < 0)) {
      setMessage("Preencha métrica, unidade e um limite válido em todas as linhas.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.moduleLimits(organizationId, moduleId),
        moduleLimitsSaveResponseSchema,
        { method: "put", json: { limites: limits } },
      );
      setLimits(response.limites.map(toDraft));
      setMessage("Limites salvos com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar os limites.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="text-sm font-semibold">Limites de uso</p>
      <p className="mt-1 text-xs text-foreground/60">
        Defina limites por métrica. Um limite sem plano vale para todos os planos associados.
      </p>
      <div className="mt-3 grid gap-3">
        {limits.map((limit, index) => (
          <div className="grid gap-2 rounded-xl border border-white/10 p-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]" key={`${moduleId}-${index}`}>
            <input className="login-input w-full px-3 text-sm outline-none" placeholder="Métrica (ex.: usuários)" value={limit.metric_key} onChange={(event) => update(index, "metric_key", event.target.value)} />
            <input className="login-input w-full px-3 text-sm outline-none" type="number" min="0" step="1" placeholder="Limite" value={String(limit.limit_value)} onChange={(event) => update(index, "limit_value", event.target.value)} />
            <input className="login-input w-full px-3 text-sm outline-none" placeholder="Unidade (ex.: mês)" value={limit.unit} onChange={(event) => update(index, "unit", event.target.value)} />
            <select className="login-input w-full px-3 text-sm outline-none" value={limit.plan_id ?? ""} onChange={(event) => update(index, "plan_id", event.target.value)}>
              <option value="">Todos os planos</option>
              {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
            </select>
            <button className="app-secondary-button" type="button" onClick={() => setLimits((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remover</button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="app-secondary-button" type="button" onClick={() => setLimits((current) => [...current, { metric_key: "", limit_value: 0, unit: "", plan_id: null }])}>Adicionar limite</button>
        <button className="app-secondary-button" type="button" disabled={saving} onClick={() => void save()}>{saving ? "Salvando..." : "Salvar limites"}</button>
      </div>
      {message ? <output className="mt-2 block text-xs text-foreground/70">{message}</output> : null}
    </div>
  );
}

function toDraft(limit: ModuleLimit): LimitDraft {
  return { plan_id: limit.plan_id, metric_key: limit.metric_key, limit_value: limit.limit_value, unit: limit.unit };
}
