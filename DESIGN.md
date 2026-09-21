---
name: WJSD Sistemas e Tecnologia
description: Plataforma SaaS multi-tenant premium para produtos de assinatura
colors:
  primary: '#8B5CF6'
  primary-hover: '#A78BFA'
  primary-strong: '#6D28D9'
  primary-gradient-end: '#5B5CF0'
  primary-border: '#6D28D9'
  on-primary: '#FFFFFF'
  ink: '#F8F7FF'
  text-secondary: '#C4BDD4'
  text-muted: '#9790A8'
  surface: '#15111F'
  surface-alt: '#1C172A'
  surface-raised: '#1C172A'
  border: '#302640'
  accent-blue: '#2563EB'
  shadow: '#00000059'
  success: '#4ADE80'
  warning: '#FBBF24'
  danger: '#F87171'
  info: '#60A5FA'
  background: '#0B0912'
typography:
  headline:
    fontFamily: '<ex.: Inter_700Bold>'
    fontSize: '32px'
    fontWeight: 700
  title:
    fontFamily: '<ex.: Inter_600SemiBold>'
    fontSize: '20px'
    fontWeight: 600
  body:
    fontFamily: '<ex.: Inter_400Regular>'
    fontSize: '15px'
    fontWeight: 400
  caption:
    fontFamily: '<ex.: Inter_400Regular>'
    fontSize: '13px'
    fontWeight: 400
spacing:
  base: 4   # escala 4pt: 4, 8, 12, 16, 24, 32...
radius:
  sm: 8
  md: 12
  lg: 18
---

# Design System: WJSD MultiSaaS

> Template. O frontmatter acima é a **fonte da verdade de tokens**: código consome daqui, nunca
> valores mágicos. Trabalho de design (criar/auditar/polir) via `impeccable`
> (ver `integracoes/impeccable.md`).

## Princípios visuais

- Hierarquia clara: cada tela apresenta uma próxima ação evidente.
- Confiança operacional: estados, erros e confirmações são explícitos e recuperáveis.
- Densidade adequada: informação suficiente para equipes, sem transformar a interface em planilha.
- Contraste WCAG AA e foco visível em todos os fluxos.
- Cor primária somente em ações primárias e estados ativos, nunca como decoração espalhada.

## Uso dos tokens

- **Cores**: referencie os tokens (nunca hex inline). `primary` = ações primárias/estados ativos.
- **Tipografia**: use os papéis (`headline`/`title`/`body`/`caption`), não tamanhos avulsos.
- **Espaçamento/raio**: escala definida no frontmatter: sem números mágicos.

## Acessibilidade

Contraste mínimo AA para texto e controles, alvos de toque de pelo menos 44px, foco visível,
labels semânticos e suporte a `prefers-reduced-motion`.

## Componentes-chave (opcional)

<Anatomia dos componentes recorrentes: botão, input, card: variantes e estados.>
