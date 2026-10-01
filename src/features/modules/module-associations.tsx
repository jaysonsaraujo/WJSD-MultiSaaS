"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import type { ProductsResponse } from "@/shared/schemas/products.schema";
import type { PlansResponse } from "@/shared/schemas/plans.schema";
import {
  moduleAssociationsSaveResponseSchema,
  type ModuleAssociations,
} from "@/shared/schemas/module-associations.schema";

type Product = ProductsResponse["produtos"][number];
type Plan = PlansResponse["planos"][number];

export function ModuleAssociations({
  organizationId,
  moduleId,
  products,
  plans,
  initialAssociations,
}: {
  organizationId: string;
  moduleId: string;
  products: Product[];
  plans: Plan[];
  initialAssociations: ModuleAssociations;
}): React.ReactNode {
  const [selectedProducts, setSelectedProducts] = useState(() =>
    initialAssociations.produtos.map((product) => product.id),
  );
  const [selectedPlans, setSelectedPlans] = useState(() =>
    initialAssociations.planos.map((plan) => plan.id),
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(): Promise<void> {
    setSaving(true);
    setMessage("");
    try {
      const response = await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.moduleAssociations(organizationId, moduleId),
        moduleAssociationsSaveResponseSchema,
        { method: "put", json: { produto_ids: selectedProducts, plano_ids: selectedPlans } },
      );
      setSelectedProducts(response.associacoes.produtos.map((product) => product.id));
      setSelectedPlans(response.associacoes.planos.map((plan) => plan.id));
      setMessage("Associações salvas com sucesso.");
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível salvar as associações.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="text-sm font-semibold">Disponibilidade do módulo</p>
      <p className="mt-1 text-xs text-foreground/60">
        Selecione os produtos e planos que poderão utilizar este módulo.
      </p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <SelectionList
          title="Produtos"
          empty="Nenhum produto ativo cadastrado."
          items={products}
          selected={selectedProducts}
          onToggle={(id) => setSelectedProducts((values) => toggle(values, id))}
        />
        <SelectionList
          title="Planos"
          empty="Nenhum plano ativo cadastrado."
          items={plans}
          selected={selectedPlans}
          onToggle={(id) => setSelectedPlans((values) => toggle(values, id))}
        />
      </div>
      <button
        className="app-secondary-button mt-4"
        type="button"
        disabled={saving}
        onClick={() => void save()}
      >
        {saving ? "Salvando..." : "Salvar associações"}
      </button>
      {message ? <output className="ml-3 text-xs text-foreground/70">{message}</output> : null}
    </div>
  );
}

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function SelectionList({
  title,
  empty,
  items,
  selected,
  onToggle,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string; name: string; slug: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}): React.ReactNode {
  return (
    <fieldset className="rounded-xl border border-white/10 p-3">
      <legend className="px-1 text-xs font-semibold text-foreground/70">{title}</legend>
      {items.length === 0 ? (
        <p className="text-xs text-foreground/50">{empty}</p>
      ) : (
        <div className="mt-1 grid gap-2">
          {items.map((item) => (
            <label className="flex cursor-pointer items-center gap-2 text-sm" key={item.id}>
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => onToggle(item.id)}
              />
              <span>{item.name}</span>
              <span className="text-xs text-foreground/50">({item.slug})</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
