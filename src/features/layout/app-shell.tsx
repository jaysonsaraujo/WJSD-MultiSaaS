"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/features/layout/logout-button";

type AppShellProps = { children: React.ReactNode };

const NAV_ITEMS = [
  ["Home", "/dashboard"],
  ["Clientes", "/clientes"],
  ["Planos", "/planos"],
  ["Pagamentos", "/pagamentos"],
  ["Produtos", "/produtos"],
  ["Módulos", "/modulos"],
  ["Ocorrências", "/ocorrencias"],
  ["Test-Drive", "/test-drive"],
  ["Uso de Recursos", "/uso-de-recursos"],
  ["Histórico", "/historico"],
  ["Configurações", "/configuracoes"],
] as const;

const ICONS = {
  Home: "home",
  Clientes: "clientes",
  Planos: "planos",
  Pagamentos: "pagamentos",
  Produtos: "produtos",
  Módulos: "modulos",
  Ocorrências: "ocorrencias",
  "Test-Drive": "test-drive",
  "Uso de Recursos": "uso-recursos",
  Histórico: "historico",
  Configurações: "configuracoes",
} as const;

const BREADCRUMB_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clientes": "Clientes",
  "/planos": "Planos",
  "/pagamentos": "Pagamentos",
  "/produtos": "Produtos",
  "/modulos": "Módulos",
  "/ocorrencias": "Ocorrências",
  "/test-drive": "Test-Drive",
  "/uso-de-recursos": "Uso de Recursos",
  "/historico": "Histórico",
  "/configuracoes": "Configurações",
  "/perfil": "Perfil",
  "/privacidade": "Privacidade",
  "/termos-de-uso": "Termos de Uso",
  "/lgpd": "LGPD",
  "/notificacoes": "Notificações",
};

function Icon({ label }: { label: keyof typeof ICONS }): React.ReactNode {
  return (
    <Image
      className="app-nav-icon"
      src={`/icons/${ICONS[label]}.png`}
      alt=""
      width={48}
      height={48}
    />
  );
}

export function AppShell({ children }: AppShellProps): React.ReactNode {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const [temaClaro, setTemaClaro] = useState(false);

  return (
    <div className={`app-shell${temaClaro ? " theme-light" : ""}`}>
      <header className="app-topbar">
        <button
          type="button"
          className="app-menu-button"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-expanded={menuAberto}
          aria-label="Abrir menu"
        >
          ☰
        </button>
        <div className="app-top-brand">
          <span className="login-brand-mark" aria-hidden="true">
            W
          </span>
          <div>
            <strong>WJSD</strong>
            <span>Sistemas que ajudam pessoas a ajudar pessoas.</span>
          </div>
        </div>
        <div className="app-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/dashboard">WJSD</Link>
          <span aria-hidden="true">/</span>
          <span>{BREADCRUMB_LABELS[pathname] ?? "Dashboard"}</span>
        </div>
        <div className="app-top-actions">
          <nav className="app-legal-links" aria-label="Informações legais">
            <Link href="/privacidade">
              <Image src="/icons/privacidade.png" alt="" width={24} height={24} />
              Privacidade
            </Link>
            <Link href="/termos-de-uso">
              <Image src="/icons/termos.png" alt="" width={24} height={24} />
              Termos de Uso
            </Link>
            <Link href="/lgpd">
              <Image src="/icons/lgpd.png" alt="" width={24} height={24} />
              LGPD
            </Link>
          </nav>
          <Link href="/notificacoes" className="app-icon-button" aria-label="Notificações">
            <Image src="/icons/notificacoes.png" alt="" width={32} height={32} />
          </Link>
          <button
            type="button"
            className="app-theme-button"
            onClick={() => setTemaClaro(!temaClaro)}
            aria-pressed={temaClaro}
          >
            <Image
              src={`/icons/${temaClaro ? "tema-dark" : "tema-light"}.png`}
              alt=""
              width={28}
              height={28}
            />
            <span>{temaClaro ? "Dark" : "Light"}</span>
          </button>
        </div>
      </header>
      <div className="app-workspace">
        <aside className={`app-sidebar${menuAberto ? " is-open" : ""}`}>
          <nav aria-label="Navegação principal" className="app-nav">
            {NAV_ITEMS.map(([label, href]) => {
              const ativo = pathname.startsWith(href);
              return (
                <Link
                  key={label}
                  href={href}
                  className={`app-nav-link${ativo ? " is-active" : ""}`}
                  onClick={() => setMenuAberto(false)}
                >
                  <Icon label={label} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="app-sidebar-footer">
            <LogoutButton />
            <a className="icons8-credit" href="https://icons8.com" target="_blank" rel="noreferrer">
              Ícones por Icons8
            </a>
          </div>
        </aside>

        <div className="app-main">
          <main className="app-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
