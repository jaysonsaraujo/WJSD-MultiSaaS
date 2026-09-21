---
name: WJSD MultiSaaS
description: Plataforma SaaS multi-tenant para produtos de assinatura, com visual claro e confiável
colors:
  primary: '#2563EB'
  primary-tint: '#EFF6FF'
  primary-border: '#BFDBFE'
  ink: '#11181C'
  text-secondary: '#6B7280'
  text-muted: '#9CA3AF'
  surface: '#FFFFFF'
  surface-alt: '#F9FAFB'
  border: '#E5E7EB'
  success: '#22C55E'
  warning: '#F59E0B'
  danger: '#EF4444'
  info: '#3B82F6'
  # dark mode (opcional)
  dm-bg: '#1A1B1F'
  dm-surface: '#222530'
  dm-fg: '#FAFAFA'
  dm-border: '#2E3340'
typography:
  headline:
    fontFamily: '<ex.: Inter_700Bold>'
    fontSize: '30px'
    fontWeight: 700
  title:
    fontFamily: '<ex.: Inter_600SemiBold>'
    fontSize: '20px'
    fontWeight: 600
  body:
    fontFamily: '<ex.: Inter_400Regular>'
    fontSize: '16px'
    fontWeight: 400
  caption:
    fontFamily: '<ex.: Inter_400Regular>'
    fontSize: '13px'
    fontWeight: 400
spacing:
  base: 4   # escala 4pt: 4, 8, 12, 16, 24, 32...
radius:
  sm: 6
  md: 10
  lg: 16
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
