import { Suspense } from "react";

import { AppShell } from "@/features/layout/app-shell";
import { PerfilForm } from "@/features/perfil/perfil-form";
import { SenhaForm } from "@/features/perfil/senha-form";
import { perfilSchema } from "@/features/perfil/perfil.schema";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";

/**
 * Carrega o perfil e monta o formulário.
 *
 * Fica separado da página porque ler o cookie (dentro do `kyServer`) torna esta
 * subárvore dinâmica. Com `cacheComponents` ligado, o Next exige que a parte
 * dinâmica esteja sob um `<Suspense>`: o shell estático vai no primeiro byte e o
 * dado chega em streaming. Isso não é cache — cada request busca fresco.
 */
async function PerfilCarregado(): Promise<React.ReactNode> {
  // O apiClient valida a resposta contra o schema antes de qualquer coisa chegar
  // na UI, então o componente recebe dado tipado, não `unknown`. Se a chamada
  // falhar, o erro sobe pro `error.tsx` mais próximo: nada de `catch` que
  // fabrica um perfil vazio.
  const perfil = await apiClient(kyServer, API_ENDPOINTS.perfil.me, perfilSchema);

  return (
    <div className="flex flex-col gap-8">
      <PerfilForm perfil={perfil} />
      <SenhaForm />
    </div>
  );
}

/**
 * Perfil do usuário: a feature de exemplo do boilerplate, ponta a ponta.
 *
 * Leitura é RSC — nenhum dado é buscado no client. Mutação é Server Action com
 * `revalidatePath` (ver `perfil.actions.ts`).
 */
export default function PerfilPage(): React.ReactNode {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
            <p className="text-sm text-foreground/60">
              Leitura em Server Component, mutação em Server Action. Edite os campos e salve.
            </p>
          </div>
        </header>

        <Suspense fallback={<p className="text-sm text-foreground/60">Carregando perfil...</p>}>
          <PerfilCarregado />
        </Suspense>
      </div>
    </AppShell>
  );
}
