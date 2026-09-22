"use client";

import Link from "next/link";
import Image from "next/image";
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

function Icon({ label }: { label: keyof typeof ICONS }): React.ReactNode {
  return (
    <Image
      className="app-nav-icon"
      src={`/icons/${ICONS[label]}.png`}
      alt=""
      width={24}
      height={24}
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
          <Link href="/">WJSD</Link>
          <span aria-hidden="true">/</span>
          <span>{pathname === "/perfil" ? "Perfil" : "Visão geral"}</span>
        </div>
        <div className="app-top-actions">
          <nav className="app-legal-links" aria-label="Informações legais">
            <a href="#privacidade">
              <Image src="/icons/privacidade.png" alt="" width={16} height={16} />
              Privacidade
            </a>
            <a href="#termos">
              <Image src="/icons/termos.png" alt="" width={16} height={16} />
              Termos de Uso
            </a>
            <a href="#lgpd">
              <Image src="/icons/lgpd.png" alt="" width={16} height={16} />
              LGPD
            </a>
          </nav>
          <button type="button" className="app-icon-button" aria-label="Notificações">
            <Image src="/icons/notificacoes.png" alt="" width={22} height={22} />
          </button>
          <button
            type="button"
            className="app-theme-button"
            onClick={() => setTemaClaro(!temaClaro)}
            aria-pressed={temaClaro}
          >
            <Image
              src={`/icons/${temaClaro ? "tema-dark" : "tema-light"}.png`}
              alt=""
              width={20}
              height={20}
            />
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
