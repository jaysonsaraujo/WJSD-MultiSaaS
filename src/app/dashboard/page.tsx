import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { perfilSchema } from "@/features/perfil/perfil.schema";
import { AppShell } from "@/features/layout/app-shell";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";

const MODULES = [
  ["Equipe", "/equipe", "equipe"],
  ["Clientes", "/clientes", "clientes"],
  ["Planos", "/planos", "planos"],
  ["Pagamentos", "/pagamentos", "pagamentos"],
  ["Produtos", "/produtos", "produtos"],
  ["Configurações", "/configuracoes", "configuracoes"],
] as const;

export default function DashboardRoute(): React.ReactNode {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Suspense
          fallback={<p className="text-sm text-foreground/60">Carregando seu ambiente...</p>}
        >
          <DashboardContent />
        </Suspense>
      </div>
    </AppShell>
  );
}

async function DashboardContent(): Promise<React.ReactNode> {
  const perfil = await apiClient(kyServer, API_ENDPOINTS.perfil.me, perfilSchema);

  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
          Visão geral
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Olá, {perfil.nome}</h1>
        <p className="max-w-2xl text-sm leading-6 text-foreground/60">
          Este é o centro de controle do seu MultiSaaS. Os módulos abaixo usam os dados reais da
          organização selecionada.
        </p>
      </header>

      <section className="app-dashboard-profile" aria-label="Conta autenticada">
        <div>
          <span className="app-development-status">Conta autenticada</span>
          <h2 className="mt-3 text-xl font-semibold">{perfil.email}</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Seu perfil está conectado ao backend WJSD e pronto para os próximos módulos.
          </p>
        </div>
        <Link className="app-secondary-button" href="/perfil">
          Ver meu perfil
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Módulos principais">
        {MODULES.map(([label, href, icon]) => (
          <Link className="app-dashboard-module" href={href} key={href}>
            <Image src={`/icons/${icon}.png`} alt="" width={48} height={48} />
            <span>{label}</span>
            <small>Disponível</small>
          </Link>
        ))}
      </section>

      <section className="app-development-card">
        <span className="app-development-status">Próxima etapa</span>
        <h2 className="mt-3 text-xl font-semibold">Ainda em aberto</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/60">
          Test-Drive, Histórico e notificações continuam aguardando contrato no backend.
        </p>
      </section>
    </>
  );
}
