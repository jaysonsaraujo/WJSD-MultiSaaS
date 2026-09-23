import { DevelopmentPage } from "@/features/layout/development-page";

export default function ConfiguracoesPage(): React.ReactNode {
  return (
    <DevelopmentPage
      title="Configurações"
      description="Ajuste preferências, integrações e regras gerais da sua conta."
      icon="configuracoes"
    />
  );
}
