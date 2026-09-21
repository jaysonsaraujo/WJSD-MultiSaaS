# Stack Sênior Review Cycle: design

Upsell do boilerplate Stack Sênior. Entrega as três skills que fecham o ciclo de PR no GitHub:
`post-review` (reviewer adversarial), `do-review` (autor responde) e `check-review` (reviewer
fecha). O boilerplate base já entrega `pre-review` (selo local antes do PR); este pacote completa
a esteira.

Origem: skills canônicas do `avante7-web` (`.agents/skills/{post,do,check}-review`), adaptadas
ao contrato do boilerplate.

## Escopo

- Repo irmão `stack-senior/stacksenior-review-cycle/`, vendido como zip próprio.
- Pré-requisito: projeto criado a partir do boilerplate (catálogo A–G em
  `.claude/docs/guardrails-catalog.md`, `CLAUDE.md` com *Branch base* e *Contrato de API*,
  `VERCEL-OXLINT-MAPPING.md`, hooks em `tooling/agent-hooks/`, regras `boilerplate/*`).
- Hosts: Claude Code, Codex, Cursor. Canônico em `.agents/skills/`; wrapper fino por host.
- Landing: segunda `Offer` em `offers.config.ts` (preço placeholder, checkout via env próprio).

Fora de escopo: funcionar em repo que não seja o boilerplate; Jira; Grok/opencode/pi.

## Estrutura do pacote

```
stacksenior-review-cycle/
  README.md                 o que é, pré-requisito, instalação, fluxo das 4 etapas, troubleshooting
  LICENSE.md                licença comercial (mesmo texto do boilerplate)
  install.sh                copia .agents/.claude/.codex/.cursor pra raiz do projeto alvo
  check.sh                  autoteste do pacote (ver Verificação)
  .agents/skills/
    post-review/SKILL.md · lenses.md · project-catalog.md
    do-review/SKILL.md
    check-review/SKILL.md
  .claude/skills/{post-review,do-review,check-review}/SKILL.md
  .codex/skills/{post-review,do-review,check-review}/SKILL.md
  .cursor/skills/{post-review,do-review,check-review}/SKILL.md
```

`install.sh <caminho-do-projeto>`: `cp -R` das quatro pastas, sem sobrescrever `settings.json`,
`hooks.json` nem skills existentes de outro nome. Recusa se o alvo não tiver
`.claude/docs/guardrails-catalog.md` (não é o boilerplate).

## Adaptações por skill

Regras gerais, valem para as três:

- Base do PR: a seção *Branch base* do `CLAUDE.md` do projeto (default `main`). Nunca `develop`
  fixo.
- Autor: menção pelo handle GitHub real do autor do PR (`gh pr view --json author`). Nenhum nome
  próprio no texto.
- Jira: removido por completo (setup, §1b, re-consulta no check-review, menções na lente 9 e nos
  relatórios).
- Referências de regra: `ADR-021` (selo por HEAD como portão do PR) no lugar de `ADR-031`;
  `boilerplate/<regra>` no lugar de `avante/<regra>`, só com nomes que existem em
  `.oxlintrc.json` (`no-manual-memo`, `no-defensive-parse`, `no-derived-state-in-effect`,
  `no-catalog-literal-compare`, `no-literal-dispatch`, `no-passthrough-mapper`,
  `no-schema-output-converter`, `no-watch-in-effect`, `api-through-lib`, `enforce-boundaries`,
  `no-index-barrel`, `no-use-cache`, `no-force-static`, `no-fetch-in-effect`).
- Camadas: `app → features → lib → shared`. Sem `domains/`, sem ceiling de
  `no-fragmentation`, sem `enforce-feature-api-modules`.
- Selo: `.agents/tmp/pre-review-<HEAD>.ok` (formato do hook do boilerplate).
- Catálogo de julgamento: A–G de `.claude/docs/guardrails-catalog.md`.
- Atribuição (`REVIEW_ATTRIBUTION` / `AUTHOR_ATTRIBUTION`): mantida; hosts canônicos só
  `Claude Code`, `OpenAI Codex`, `Cursor Agent`.
- Shell: texto de review nunca passa por expansão (sempre `jq --arg`/`--rawfile` ou
  `-F body=@file`). Mantido.

### post-review

- §0 atribuição: tabela de hosts reduzida a três.
- §1 setup: igual, sem Jira. Lê `AGENTS.md`, `ARCHITECTURE.md`, `CODE-PATTERN.md`, `MEMORY.md`.
- §1b Jira: removido.
- §1c contratos: condicional. Lê `$API_CONTRACT_PATH` da seção *Contrato de API* do
  `CLAUDE.md`. Definido (path local ou URL de repo) e diff tocando borda de API
  (`*.request.ts`, `*.server.ts`, `endpoints.ts`, `*.schema.ts` consumido por eles) → baixa/lê a
  spec e roda a lente 8. Não definido → pula a lente 8, registra no relatório e no comentário
  geral como ressalva; conclusão não pode ser `Approve` limpo quando houver borda de API sem
  contrato verificado.
- §2 lentes: 1 a 7 sempre; 8 condicional; 9 sozinha depois. Claude Code = tool `Workflow`,
  `model: "opus"`. Codex e Cursor = subagentes do host, modelo herdado da sessão.
- `lenses.md`: bloco *Stakes* reescrito ("este review é a última revisão técnica antes do merge;
  o que passar aqui chega ao usuário"). Lente 1 sem `domains/` e sem cap de módulos de API.
  Lentes 5 a 7 apontam para `VERCEL-OXLINT-MAPPING.md § Regras arquiteturais`. Lente 8 genérica
  (spec OpenAPI em `$API_CONTRACT_PATH`). Lente 9 sem Jira.
- `project-catalog.md`: tabela must-flag reescrita com as fontes do boilerplate (AGENTS,
  ARCHITECTURE, CODE-PATTERN §9, ADR-021, catálogo A–G, Vercel). Famílias de gate listadas
  com as regras `boilerplate/*` reais. Relação com pre-review usa o selo sem slug.
- §4 comentários inline, §5 geral, §6 relatório: iguais, sem itens de Jira.

### do-review

- Sem menção a Jira ou `avante7-docs`; âncoras de contestação = ADR em `MEMORY.md`, contrato em
  `$API_CONTRACT_PATH`, discussão no PR.
- Referência de gate enfraquecido: ADR-021 e hooks de `tooling/agent-hooks/`.
- Commit/push: `verify` roda no pre-push via lefthook (igual).

### check-review

- Sem Jira. Inventário, âncora positiva, drift de head, respostas em tom de colega, approve só
  com confirmação: mantidos.

### Wrappers

Mesmo formato do Avante: frontmatter `name`/`description`/`argument-hint`/`allowed-tools`,
corpo "leia e siga o canônico em `.agents/skills/<skill>/SKILL.md`" mais o específico do host
(Claude: `Workflow` + `model: "opus"`; Codex/Cursor: subagentes do host, sessão herdada).
Sem tools de Jira no `allowed-tools`.

## Landing

`src/lib/offers.config.ts`: nova `Offer` `id: 'review-cycle'`, `highlight: false`,
`checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL_REVIEW ?? ''`, preço placeholder
`R$ 47,00` com nota "preço de lançamento a definir" só no comentário do código. `.env.example`
ganha a variável. `oferta.tsx` já renderiza a lista; conferir layout com duas ofertas e ajustar
grid se quebrar no mobile.

## Verificação

`check.sh` (roda em CI manual e antes de zipar):

1. Cada wrapper em `.claude/.codex/.cursor` cita um canônico que existe.
2. `grep -ri` por `avante`, `jira`, `rizzo`, `develop`, `ADR-031`, `domains/`, `Fabrício`,
   `Grok`, `opencode` nos `.agents`/wrappers retorna vazio.
3. `install.sh` numa cópia temporária do boilerplate cria as 12 pastas e não altera
   `settings.json`/`hooks.json` (diff vazio nesses arquivos).

Landing: `bun run validate`.

## Não-objetivos

- Reescrever o conteúdo das lentes além da adaptação de referências.
- Hook novo no boilerplate (o ciclo é acionado por comando, não por gate).
- Vender separado do boilerplate.
