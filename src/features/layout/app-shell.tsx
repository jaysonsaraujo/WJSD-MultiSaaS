"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/features/layout/logout-button";

type AppShellProps = { children: React.ReactNode };

const NAV_ITEMS = [
  ["Home", "/"],
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

function Icon({ label }: { label: string }): React.ReactNode {
  return (
    <span className="app-nav-icon" aria-hidden="true">
      {label.slice(0, 1)}
    </span>
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
          <Link href="/">WJSD</Link>
          <span aria-hidden="true">/</span>
          <span>{pathname === "/perfil" ? "Perfil" : "Visão geral"}</span>
        </div>
        <div className="app-top-actions">
          <nav className="app-legal-links" aria-label="Informações legais">
            <a href="#privacidade">Privacidade</a>
            <a href="#termos">Termos de Uso</a>
            <a href="#lgpd">LGPD</a>
          </nav>
          <button type="button" className="app-icon-button" aria-label="Notificações">
            🔔
          </button>
          <button
            type="button"
            className="app-theme-button"
            onClick={() => setTemaClaro(!temaClaro)}
            aria-pressed={temaClaro}
          >
            {temaClaro ? "☾" : "☼"}
            <span>{temaClaro ? "Dark" : "Light"}</span>
          </button>
        </div>
      </header>
      <div className="app-workspace">
        <aside className={`app-sidebar${menuAberto ? " is-open" : ""}`}>
          <div className="app-sidebar-brand">
            <span className="login-brand-mark" aria-hidden="true">
              W
            </span>
            <div>
              <strong>WJSD</strong>
              <span>Sistemas e Tecnologia</span>
            </div>
          </div>
          <nav aria-label="Navegação principal" className="app-nav">
            {NAV_ITEMS.map(([label, href]) => {
              const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <a
                  key={label}
                  href={href}
                  className={`app-nav-link${ativo ? " is-active" : ""}`}
                  onClick={(event) => {
                    if (href !== "/") event.preventDefault();
                    setMenuAberto(false);
                  }}
                  title={href === "/" ? undefined : "Módulo em preparação"}
                >
                  <Icon label={label} />
                  <span>{label}</span>
                </a>
              );
            })}
          </nav>
          <div className="app-sidebar-footer">
            <LogoutButton />
          </div>
        </aside>

        <div className="app-main">
          <main className="app-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
