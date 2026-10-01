"use client";

import { useState } from "react";

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import { productResponseSchema, type ProductsResponse } from "@/shared/schemas/products.schema";

type Product = ProductsResponse["produtos"][number];

export function ProductManager({
  organizationId,
  initialProducts,
}: {
  organizationId: string;
  initialProducts: Product[];
}): React.ReactNode {
  const [products, setProducts] = useState(initialProducts);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function createProduct(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (editingId) {
      await updateProduct(editingId);
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.products(organizationId),
        productResponseSchema,
        {
          method: "post",
          json: { nome: name, descricao: description || null },
        },
      );
      setProducts((current) => [...current, response.produto]);
      setName("");
      setDescription("");
      setMessage("Produto criado com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar o produto.");
    } finally {
      setSaving(false);
    }
  }

  function iniciarEdicao(product: Product): void {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description ?? "");
    setMessage("");
  }

  async function updateProduct(productId: string): Promise<void> {
    setSaving(true);
    setMessage("");
    try {
      const response = await apiClient(
        kyClient,
        `${API_ENDPOINTS.organizations.products(organizationId)}/${productId}`,
        productResponseSchema,
        { method: "patch", json: { nome: name, descricao: description || null } },
      );
      setProducts((current) =>
        current.map((product) => (product.id === productId ? response.produto : product)),
      );
      setEditingId(null);
      setName("");
      setDescription("");
      setMessage("Produto atualizado com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar o produto.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(productId: string): Promise<void> {
    if (!window.confirm("Remover este produto?")) return;
    setSaving(true);
    try {
      await apiClient(
        kyClient,
        `${API_ENDPOINTS.organizations.products(organizationId)}/${productId}`,
        undefined,
        { method: "delete" },
      );
      setProducts((current) => current.filter((product) => product.id !== productId));
      setMessage("Produto removido com sucesso.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível remover o produto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form className="app-development-card flex flex-col gap-4" onSubmit={createProduct}>
        <span className="app-development-status">
          {editingId ? "Editar produto" : "Novo produto"}
        </span>
        <h2 className="text-xl font-semibold">
          {editingId ? "Atualizar produto" : "Cadastrar produto"}
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
          Descrição
          <textarea
            className="login-input min-h-24 w-full px-4 py-3 text-sm outline-none"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <button
          className="login-primary-button px-4 text-sm font-semibold disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Salvando..." : editingId ? "Atualizar produto" : "Cadastrar produto"}
        </button>
        {message ? <output className="text-sm text-foreground/70">{message}</output> : null}
      </form>
      <section className="app-development-card">
        <span className="app-development-status">Dados reais</span>
        <h2 className="mt-3 text-xl font-semibold">Produtos cadastrados</h2>
        {products.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">
            Nenhum produto cadastrado nesta organização.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {products.map((product) => (
              <li className="app-dashboard-module" key={product.id}>
                <strong>{product.name}</strong>
                <small>{product.status === "active" ? "Ativo" : "Inativo"}</small>
                {product.description ? <span>{product.description}</span> : null}
                <span className="mt-2 flex gap-2">
                  <button
                    className="app-secondary-button"
                    type="button"
                    onClick={() => iniciarEdicao(product)}
                  >
                    Editar
                  </button>
                  <button
                    className="app-secondary-button"
                    type="button"
                    onClick={() => void removeProduct(product.id)}
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
