import Image from "next/image";
import Link from "next/link";

import { AppShell } from "@/features/layout/app-shell";

const MODULES = [
  ["Clientes", "/clientes", "clientes"],
  ["Planos", "/planos", "planos"],
  ["Pagamentos", "/pagamentos", "pagamentos"],
  ["Produtos", "/produtos", "produtos"],
] as const;

export default function DashboardRoute(): React.ReactNode {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
            Visão geral
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="max-w-2xl text-sm leading-6 text-foreground/60">
            Acompanhe a evolução do seu MultiSaaS em um único lugar. Os indicadores serão
            alimentados pelos dados reais dos seus módulos.
          </p>
        </header>

        <section
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Módulos principais"
        >
          {MODULES.map(([label, href, icon]) => (
            <Link className="app-dashboard-module" href={href} key={href}>
              <Image src={`/icons/${icon}.png`} alt="" width={48} height={48} />
              <span>{label}</span>
              <small>Em desenvolvimento</small>
            </Link>
          ))}
        </section>

        <section className="app-development-card">
          <span className="app-development-status">Fundação pronta</span>
          <h2 className="mt-3 text-xl font-semibold">Seu ambiente está configurado</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/60">
            Use a barra lateral para explorar a estrutura do produto. Cada área receberá seus fluxos
            de negócio sem alterar a identidade visual do app.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
