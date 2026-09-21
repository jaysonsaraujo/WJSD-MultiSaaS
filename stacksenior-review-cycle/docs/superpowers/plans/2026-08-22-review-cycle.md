# Review Cycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Empacotar `post-review`, `do-review` e `check-review` (origem: avante7-web) como upsell instalável sobre o boilerplate Stack Sênior, mais a segunda Offer na landing.

**Architecture:** Canônico em `.agents/skills/`, wrapper fino por host em `.claude/.codex/.cursor`. Um `install.sh` copia pro projeto alvo; um `check.sh` prova que o pacote não carrega resíduo do Avante e que os wrappers apontam pra arquivos existentes.

**Tech Stack:** Markdown (skills), bash (install/check), TypeScript (landing).

**Spec:** `docs/superpowers/specs/2026-08-22-review-cycle-design.md`

## Global Constraints

- Origem: `/home/fabriciosiqueira/Documentos/pessoal/Avante7/avante7-web/.agents/skills/{post-review,do-review,check-review}`.
- Alvo de referência: `/home/fabriciosiqueira/Documentos/pessoal/stack-senior/stacksenior-boilerplate`.
- Termos proibidos no pacote (case-insensitive): `avante`, `jira`, `rizzo`, `develop`, `ADR-031`, `domains/`, `Fabrício`, `Fabricio`, `Grok`, `opencode`, `no-fragmentation`, `enforce-feature-api-modules`, `FRONTEND-`.
- Selo: `.agents/tmp/pre-review-<HEAD>.ok`. ADR do gate: `ADR-021`. Regras: `boilerplate/*`. Catálogo: A–G.
- Copy em PT-BR, sem travessão na landing.

---

### Task 1: Esqueleto + check.sh (teste primeiro)

**Files:**
- Create: `check.sh`, `LICENSE.md`, `.gitignore`

- [ ] **Step 1: Escrever `check.sh`** (falha enquanto o pacote estiver vazio)

```bash
#!/usr/bin/env bash
# Autoteste do pacote. Sai 1 no primeiro defeito.
set -euo pipefail
cd "$(dirname "$0")"
fail() { echo "FALHA: $*" >&2; exit 1; }

SKILLS=(post-review do-review check-review)
for s in "${SKILLS[@]}"; do
  [ -f ".agents/skills/$s/SKILL.md" ] || fail "canônico ausente: .agents/skills/$s/SKILL.md"
  for host in .claude .codex .cursor; do
    w="$host/skills/$s/SKILL.md"
    [ -f "$w" ] || fail "wrapper ausente: $w"
    grep -q "\.agents/skills/$s/SKILL\.md" "$w" || fail "$w não aponta pro canônico"
  done
done
for f in lenses.md project-catalog.md; do
  [ -f ".agents/skills/post-review/$f" ] || fail "post-review/$f ausente"
done

FORBIDDEN='avante|jira|rizzo|develop|ADR-031|domains/|fabr[ií]cio|grok|opencode|no-fragmentation|enforce-feature-api-modules|FRONTEND-'
if grep -rniE "$FORBIDDEN" .agents .claude .codex .cursor README.md; then
  fail "resíduo do projeto de origem encontrado acima"
fi

[ -x install.sh ] || fail "install.sh não é executável"
echo "OK"
```

- [ ] **Step 2: `chmod +x check.sh && ./check.sh`** → esperado: `FALHA: canônico ausente: .agents/skills/post-review/SKILL.md`
- [ ] **Step 3: Copiar `LICENSE.md` do boilerplate e criar `.gitignore`** com `.agents/tmp/` e `*.zip`.
- [ ] **Step 4: `git init && git add -A && git commit -m "chore: esqueleto do pacote e autoteste"`**

### Task 2: Copiar canônicos e adaptar `post-review`

**Files:**
- Create: `.agents/skills/post-review/{SKILL.md,lenses.md,project-catalog.md}`

- [ ] **Step 1: Copiar** os três arquivos da origem.
- [ ] **Step 2: Editar `SKILL.md`** conforme o spec § post-review:
  - Remover §1b inteiro; remover "bloqueio Jira" do §5 e do §6; remover linha de Jira em Restrições.
  - §0: tabela de hosts só `Claude Code`, `OpenAI Codex`, `Cursor Agent`; parágrafo de descoberta sem Grok/opencode.
  - §1: `@Fabrício` → "handle do autor (`.author.login`)".
  - §1c: substituir bloco `avante7-docs` por: ler `$API_CONTRACT_PATH` da seção *Contrato de API* do `CLAUDE.md`; path local → `cat`; URL GitHub → `gh api .../contents/<path>` + `base64 -d`; indefinido → pular lente 8 com ressalva.
  - §2 tabela de modelo por host: três linhas.
  - `ADR-031` → `ADR-021`; `.agents/tmp/pre-review-<HEAD>--<base-slug>.ok` → `.agents/tmp/pre-review-<HEAD>.ok`.
- [ ] **Step 3: Editar `lenses.md`**: Stakes reescrito; lente 1 sem `domains/`, sem "Cap de API", sem `avante`; lente 3 "contrato canônico em `$API_CONTRACT_PATH`"; lente 7 `boilerplate/no-derived-state-in-effect`; lente 8 título "Contratos de API (`$API_CONTRACT_PATH`)" e "sync na spec"; lente 9 sem "escalá-la a Jira".
- [ ] **Step 4: Editar `project-catalog.md`**: must-flag sem linhas de `domains/`, `enforce-feature-api-modules`, `no-catalog-id-literal`→`no-catalog-literal-compare`, inglês em URL (manter), ADR-031→ADR-021, `avante7-docs`→`$API_CONTRACT_PATH`; famílias com nomes `boilerplate/*`; relação com pre-review com selo sem slug.
- [ ] **Step 5: `./check.sh`** → ainda falha por wrappers ausentes, mas a linha de resíduo não pode disparar em `post-review`. Verificar com `grep -rniE "$FORBIDDEN" .agents/skills/post-review` vazio.
- [ ] **Step 6: Commit** `feat(post-review): canônico adaptado ao boilerplate`.

### Task 3: Adaptar `do-review` e `check-review`

**Files:**
- Create: `.agents/skills/do-review/SKILL.md`, `.agents/skills/check-review/SKILL.md`

- [ ] **Step 1: Copiar** os dois da origem.
- [ ] **Step 2: `do-review`**: `avante7-docs` → `$API_CONTRACT_PATH`; `ADR-031` → `ADR-021`; nada de Jira (não há).
- [ ] **Step 3: `check-review`**: remover parágrafo "Jira: se o review…" do §0, "Jira re-consultado" dos §3b/§4/Restrições; `avante7-docs` → `$API_CONTRACT_PATH`; `ADR-031` → `ADR-021`.
- [ ] **Step 4: `grep -rniE "$FORBIDDEN" .agents`** vazio.
- [ ] **Step 5: Commit** `feat(do-review,check-review): canônicos adaptados`.

### Task 4: Wrappers por host

**Files:**
- Create: `.claude/skills/<s>/SKILL.md`, `.codex/skills/<s>/SKILL.md`, `.cursor/skills/<s>/SKILL.md` (9 arquivos)

- [ ] **Step 1: Claude** (modelo: `.claude/skills/post-review/SKILL.md`)

```markdown
---
name: post-review
description: >-
  Adversarial senior PR review against the PR base: ultracode lenses via Opus
  subagents, devil's-advocate filter, then GitHub comments. Use when the user
  asks for post-review, adversarial review, deep PR review, or /post-review.
argument-hint: "[número-do-PR]"
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git *), Bash(bun *), Bash(jq *), Read, Grep, Glob, Workflow, AskUserQuestion
---

# Post-review

Leia completamente e siga a skill canônica em
`.agents/skills/post-review/SKILL.md`. Específico deste host: ultracode = tool
**Workflow** num único workflow, `model: "opus"`; nunca o tool Agent/Task.
Argumento = número do PR; vazio = PR da branch atual.
```
  `do-review` e `check-review`: mesmo frontmatter da origem (allowed-tools sem `mcp__jira__*`), corpo "Leia e siga `.agents/skills/<s>/SKILL.md`".
- [ ] **Step 2: Codex e Cursor**: copiar da origem; em `post-review` trocar a linha de modelo por "herde o modelo da sessão".
- [ ] **Step 3: `./check.sh`** → falha só em `install.sh`.
- [ ] **Step 4: Commit** `feat: wrappers por host`.

### Task 5: `install.sh` + README

**Files:**
- Create: `install.sh`, `README.md`

- [ ] **Step 1: `install.sh`**

```bash
#!/usr/bin/env bash
# Instala o Review Cycle num projeto criado a partir do Stack Sênior.
# Uso: ./install.sh /caminho/do/projeto
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:?uso: ./install.sh /caminho/do/projeto}"
[ -f "$DEST/.claude/docs/guardrails-catalog.md" ] \
  || { echo "Alvo não parece um projeto Stack Sênior (sem .claude/docs/guardrails-catalog.md)." >&2; exit 1; }
for s in post-review do-review check-review; do
  for dir in .agents .claude .codex .cursor; do
    mkdir -p "$DEST/$dir/skills"
    rm -rf "$DEST/$dir/skills/$s"
    cp -R "$SRC/$dir/skills/$s" "$DEST/$dir/skills/$s"
  done
done
echo "Instalado: /post-review, /do-review, /check-review em $DEST"
```

- [ ] **Step 2: Teste manual**: `cp -R boilerplate /tmp/x && ./install.sh /tmp/x && diff <(cd boilerplate && md5sum .claude/settings.json .codex/hooks.json .cursor/hooks.json) <(cd /tmp/x && md5sum ...)` → diff vazio; `ls /tmp/x/.claude/skills | grep review` lista 4 (pre + 3).
- [ ] **Step 3: README.md**: o que é; esteira (pre → post → do → check, tabela); pré-requisito; instalação; uso por host; `$API_CONTRACT_PATH` opcional; troubleshooting (selo, drift de head, lente 8 pulada).
- [ ] **Step 4: `./check.sh`** → `OK`. Commit `feat: install.sh e README`.

### Task 6: Landing: segunda Offer

**Files:**
- Modify: `stacksenior-landing/src/lib/offers.config.ts`, `.env.example`
- Verify: `src/components/sections/oferta.tsx` com 2 cards no mobile

- [ ] **Step 1:** Adicionar Offer `review-cycle` (`highlight: false`, `checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL_REVIEW ?? ''`, `priceLabel: 'R$ 47,00'`, features em PT-BR sem travessão, liderando pela dor: "a IA abriu o PR e ninguém revisou").
- [ ] **Step 2:** `.env.example` ganha `NEXT_PUBLIC_CHECKOUT_URL_REVIEW=`.
- [ ] **Step 3:** `bun run validate`; `bun run dev` e conferir `oferta.tsx` em 390px.
- [ ] **Step 4:** Commit na landing `feat(oferta): upsell Review Cycle`.
