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
    <div className="profile-layout">
      <aside className="profile-summary-card">
        <h2>Informações do Perfil</h2>
        <p className="profile-summary-subtitle">Seus dados pessoais e foto</p>
        <div className="profile-avatar" aria-label={`Avatar de ${perfil.nome}`}>
          {perfil.nome.slice(0, 2).toUpperCase()}
        </div>
        <button className="profile-outline-button" type="button" disabled>
          Alterar foto
        </button>
        <button className="profile-text-button" type="button" disabled>
          Remover foto
        </button>
        <small className="profile-help-text">PNG, JPG ou WEBP até 1MB.</small>
        <dl className="profile-summary-list">
          <div>
            <dt>Nome de usuário</dt>
            <dd>{perfil.nome}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{perfil.email}</dd>
          </div>
          <div>
            <dt>Telefone (WhatsApp)</dt>
            <dd>{perfil.telefone ?? "Não informado"}</dd>
          </div>
          <div>
            <dt>Função</dt>
            <dd>Não informado</dd>
          </div>
          <div>
            <dt>Membro desde</dt>
            <dd>Não informado</dd>
          </div>
        </dl>
      </aside>

      <section className="profile-settings-card">
        <header>
          <h2>Configurações da Conta</h2>
          <p>Atualize suas informações pessoais</p>
        </header>
        <PerfilForm perfil={perfil} />
        <div className="profile-address-field">
          <label htmlFor="perfil-endereco">Endereço</label>
          <textarea
            id="perfil-endereco"
            rows={3}
            disabled
            placeholder="Endereço será disponibilizado na próxima versão."
          />
          <small>O endereço ainda não faz parte do contrato atual do backend.</small>
        </div>
        <SenhaForm />
      </section>
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
      <div className="mx-auto flex w-full max-w-[118rem] flex-col gap-5">
        <header className="profile-page-header">
          <h1>Perfil do Usuário</h1>
          <p>Atualize suas informações pessoais e preferências de segurança.</p>
        </header>

        <Suspense fallback={<p className="text-sm text-foreground/60">Carregando perfil...</p>}>
          <PerfilCarregado />
        </Suspense>
      </div>
    </AppShell>
  );
}
