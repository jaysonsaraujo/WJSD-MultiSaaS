import Image from "next/image";

import { AppShell } from "@/features/layout/app-shell";

type DevelopmentPageProps = {
  title: string;
  description: string;
  icon: string;
};

export function DevelopmentPage({
  title,
  description,
  icon,
}: DevelopmentPageProps): React.ReactNode {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start gap-4">
          <Image
            className="app-development-icon"
            src={`/icons/${icon}.png`}
            alt=""
            width={56}
            height={56}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              Área do MultiSaaS
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">{description}</p>
          </div>
        </header>

        <section className="app-development-card">
          <div className="flex flex-col gap-3">
            <span className="app-development-status">Em desenvolvimento</span>
            <h2 className="text-xl font-semibold">Estamos preparando este módulo</h2>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              A navegação e a estrutura visual já estão disponíveis. As operações deste módulo serão
              conectadas ao contrato real da API nas próximas etapas.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
