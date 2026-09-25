"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import { moduleResponseSchema, type ModulesResponse } from "@/shared/schemas/modules.schema";
import { ModuleAssociations } from "@/features/modules/module-associations";
import type { ProductsResponse } from "@/shared/schemas/products.schema";
import type { PlansResponse } from "@/shared/schemas/plans.schema";
import type { ModuleAssociations as ModuleAssociationsData } from "@/shared/schemas/module-associations.schema";

type Module = ModulesResponse["modulos"][number];

export function ModuleManager({
  organizationId,
  initialModules,
  products,
  plans,
  initialAssociations,
}: {
  organizationId: string;
  initialModules: Module[];
  products: ProductsResponse["produtos"];
  plans: PlansResponse["planos"];
  initialAssociations: Record<string, ModuleAssociationsData>;
}): React.ReactNode {
  const [modules, setModules] = useState(initialModules);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [sortOrder, setSortOrder] = useState("0");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [associationModuleId, setAssociationModuleId] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const ordem = Number(sortOrder);
    if (!Number.isInteger(ordem) || ordem < 0) {
      setMessage("Informe uma ordem válida.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const path = editingId
        ? `${API_ENDPOINTS.organizations.modules(organizationId)}/${editingId}`
        : API_ENDPOINTS.organizations.modules(organizationId);
      const response = await apiClient(kyClient, path, moduleResponseSchema, {
        method: editingId ? "patch" : "post",
        json: {
          nome: name,
          slug: slug || undefined,
          descricao: description || null,
          status,
          ordem,
        },
      });
      setModules((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? response.modulo : item))
          : [...current, response.modulo],
      );
      resetForm();
      setMessage(editingId ? "Módulo atualizado com sucesso." : "Módulo criado com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o módulo.");
    } finally {
      setSaving(false);
    }
  }
  function startEditing(item: Module): void {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setDescription(item.description ?? "");
    setStatus(item.status);
    setSortOrder(String(item.sort_order));
    setMessage("");
  }
  async function removeModule(id: string): Promise<void> {
    if (!window.confirm("Remover este módulo?")) return;
    setSaving(true);
    setMessage("");
    try {
      await apiClient(
        kyClient,
        `${API_ENDPOINTS.organizations.modules(organizationId)}/${id}`,
        undefined,
        { method: "delete" },
      );
      setModules((current) => current.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
      setMessage("Módulo removido com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível remover o módulo.");
    } finally {
      setSaving(false);
    }
  }
  function resetForm(): void {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setStatus("active");
    setSortOrder("0");
  }
  return (
    <>
      <form className="app-development-card flex flex-col gap-4" onSubmit={submit}>
        <span className="app-development-status">
          {editingId ? "Editar módulo" : "Novo módulo"}
        </span>
        <h2 className="text-xl font-semibold">
          {editingId ? "Atualizar módulo" : "Cadastrar módulo"}
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
            Ordem
            <input
              className="login-input w-full px-4 text-sm outline-none"
              type="number"
              min="0"
              step="1"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Status
            <select
              className="login-input w-full px-4 text-sm outline-none"
              value={status}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "active" || value === "inactive") setStatus(value);
              }}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </label>
        </div>
        <button
          className="login-primary-button px-4 text-sm font-semibold disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Salvando..." : editingId ? "Atualizar módulo" : "Cadastrar módulo"}
        </button>
        {message ? <output className="text-sm text-foreground/70">{message}</output> : null}
      </form>
      <section className="app-development-card">
        <span className="app-development-status">Dados reais</span>
        <h2 className="mt-3 text-xl font-semibold">Módulos cadastrados</h2>
        {modules.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">
            Nenhum módulo cadastrado nesta organização.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {modules
              .toSorted((a, b) => a.sort_order - b.sort_order)
              .map((item) => (
                <li className="app-dashboard-module" key={item.id}>
                  <strong>{item.name}</strong>
                  <small>
                    Ordem {item.sort_order} · {item.status === "active" ? "Ativo" : "Inativo"}
                  </small>
                  {item.description ? <span>{item.description}</span> : null}
                  <span className="mt-2 flex gap-2">
                    <button
                      className="app-secondary-button"
                      type="button"
                      onClick={() => startEditing(item)}
                    >
                      Editar
                    </button>
                    <button
                      className="app-secondary-button"
                      type="button"
                      disabled={saving}
                      onClick={() => void removeModule(item.id)}
                    >
                      Remover
                    </button>
                    <button
                      className="app-secondary-button"
                      type="button"
                      onClick={() =>
                        setAssociationModuleId((current) => (current === item.id ? null : item.id))
                      }
                    >
                      {associationModuleId === item.id ? "Fechar associações" : "Associar"}
                    </button>
                  </span>
                  {associationModuleId === item.id ? (
                    <ModuleAssociations
                      organizationId={organizationId}
                      moduleId={item.id}
                      products={products}
                      plans={plans}
                      initialAssociations={
                        initialAssociations[item.id] ?? { produtos: [], planos: [] }
                      }
                    />
                  ) : null}
                </li>
              ))}
          </ul>
        )}
      </section>
    </>
  );
}
