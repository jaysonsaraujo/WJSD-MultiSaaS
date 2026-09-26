import Image from "next/image";
import { cookies } from "next/headers";

import { AppShell } from "@/features/layout/app-shell";
import { ProductManager } from "@/features/products/product-manager";
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
        {organizationId ? (
          <ProductManager organizationId={organizationId} initialProducts={products} />
        ) : (
          <section className="app-development-card">
            <p className="text-sm text-foreground/60">
              Selecione uma organização para gerenciar produtos.
            </p>
          </section>
        )}
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
