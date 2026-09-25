import Image from "next/image";
import { cookies } from "next/headers";

import { AppShell } from "@/features/layout/app-shell";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { productsResponseSchema, type ProductsResponse } from "@/shared/schemas/products.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export const instant = false;

export default async function ProdutosPage(): Promise<React.ReactNode> {
  const organizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;
  const products = organizationId ? await loadProducts(organizationId) : [];

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src="/icons/produtos.png"
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Catálogo
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Produtos</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Organize os produtos e experiências da organização selecionada.
            </p>
          </div>
        </header>
        <section className="app-development-card">
          <span className="app-development-status">Dados reais</span>
          <h2 className="mt-3 text-xl font-semibold">Produtos cadastrados</h2>
          {products.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-foreground/60">
              Nenhum produto cadastrado nesta organização. O cadastro será habilitado na próxima
              etapa.
            </p>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {products.map((product) => (
                <li className="app-dashboard-module" key={product.id}>
                  <strong>{product.name}</strong>
                  <small>{product.status === "active" ? "Ativo" : "Inativo"}</small>
                  {product.description ? <span>{product.description}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

async function loadProducts(organizationId: string): Promise<ProductsResponse["produtos"]> {
  try {
    const response = await apiClient(
      kyServer,
      API_ENDPOINTS.organizations.products(organizationId),
      productsResponseSchema,
    );
    return response.produtos;
  } catch {
    return [];
  }
}
