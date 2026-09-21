---
name: post-review
description: >-
  Adversarial senior PR review against the PR base: ultracode lenses via
  host-specific subagents (Claude Code, Codex, Cursor), devil's-advocate
  filter, then GitHub inline + general comments. Use when the user asks for post-review, adversarial
  review, deep PR review, review after PR open, or /post-review.
---

# Post-review (adversarial)

Revise a branch **depois** que o PR existe no GitHub. Este review é
**adversarial**: assume que a mudança pode estar errada, pressiona decisões
de design/contrato/simplicidade e só depois corta o que não se sustenta.
Publique o que sobreviver com evidência. Não altere código, não commite, não
faça push e não aprove o PR automaticamente.

Contraste com skills irmãs:

| Skill | Quando | Saída |
|-------|--------|-------|
| `pre-review` | Antes de `gh pr create` | Relatório local + selo `.agents/tmp/*.ok` |
| `post-review` | PR aberto | Review adversarial no GitHub |
| `do-review` | Findings publicados (lado do autor) | Fixes + justificativas nas threads |
| `check-review` | Autor respondeu aos findings | Threads resolvidas + ✅ ou pendências |

Julgamento compartilhado com `pre-review` (simplificação, hard cutover, sem
fallback fabricado). Defeito de família mecânica segue a regra de
[project-catalog.md](project-catalog.md) § "Famílias dos gates": CI vermelho
já apontando = silêncio; CI verde com o defeito = violação + furo de gate.

## Postura

- Lentes 1–8: ataque máximo. Procure o que quebra manutenção, contrato,
  previsibilidade, performance, hard cutover, SRP, observabilidade. Não
  suavize o tom de abertura com metas de “publicar pouco” ou “não ser chato”.
- Lente 9 + consolidação: único filtro. Descarte o que não tem evidência,
  nitpick sem impacto, ou duplicata no PR. Preexistente **confirmado** não se
  descarta: publica com a causalidade explícita (lenses.md § lente 9).
- Publique **tudo** que sobreviver ao devil’s advocate com evidência. Sem
  teto artificial de quantidade. Refutação sem fonte não descarta.
- Nitpick sem impacto some. Estilo sozinho não é blocker. Complexidade
  acidental, contrato, fallback, dual-path e regra de negócio no front **são**.

## 0. Atribuição do host

Antes de qualquer comentário, defina `REVIEW_ATTRIBUTION`:

- **Auto-identidade é a fonte**: assine com o host que **você é** — seu
  próprio harness/system prompt diz quem você é. Nunca derive o host de
  variável de ambiente de provider, de arquivo que você leu ou de palpite.
  Provider de modelo ≠ host.
- Formato: `<host> - <modelo da sessão> <reasoning da sessão>`. Anexe
  modelo/reasoning só se os souber com certeza; senão publique só o nome do
  host — nunca invente modelo ou reasoning, e nunca fixe um modelo no texto
  da skill.
- Nomes canônicos dos hosts: `Claude Code`, `OpenAI Codex`, `Cursor Agent`.
  Host fora da lista assina com o nome pelo qual se conhece — nunca com o de
  outro host.

Descoberta: Claude usa `.claude/skills/post-review/`; Cursor usa
`.cursor/skills/post-review/`; Codex usa `.codex/skills/post-review/`. Se o
Codex da sessão não listar a skill do repo, instale/copie também para
`$CODEX_HOME/skills/post-review/` apontando para o canônico.

## 1. Escopo e setup

Argumento: número do PR (vazio = PR da branch atual).

Pin o head **do PR selecionado** no início e use esse SHA em todo o fluxo
(diff, subagentes, publicação). Não assuma que o `HEAD` local é o PR.

```bash
git fetch origin --quiet
PR_JSON=$(gh pr view <PR> --json number,url,title,author,baseRefName,headRefName,headRefOid,commits,body,comments)
BASE=$(printf '%s' "$PR_JSON" | jq -r .baseRefName)
REVIEW_SHA=$(printf '%s' "$PR_JSON" | jq -r .headRefOid)
HEAD_REF=$(printf '%s' "$PR_JSON" | jq -r .headRefName)
git fetch origin "$HEAD_REF" --quiet
# Discussion completa: Conversation + reviews + inline
gh api "repos/{owner}/{repo}/issues/<PR>/comments" --paginate
gh api "repos/{owner}/{repo}/pulls/<PR>/comments" --paginate
gh api "repos/{owner}/{repo}/pulls/<PR>/reviews" --paginate
git diff --stat "origin/${BASE}...${REVIEW_SHA}"
# Estado do CI — alimenta a regra "Famílias dos gates" do catálogo
gh pr checks <PR>
```

O resultado de `gh pr checks` decide o ramo da política de famílias de gate
(catálogo § "Famílias dos gates"): check **fail** apontando o defeito =
silêncio; tudo **pass** com o defeito no diff = violação + furo de gate.
Check **pending/skipping/cancel** não é verde: nesse estado, publique o
defeito como violação normal sem alegar furo de gate. Repasse esse estado aos
subagentes das lentes.

- `REVIEW_SHA` = `headRefOid` do PR no setup. Diff e subagentes usam
  `origin/<base>...${REVIEW_SHA}` (objeto do fetch), **nunca** `...HEAD` local
  salvo se você acabou de verificar que `git rev-parse HEAD` == `REVIEW_SHA`.
- Se o checkout local não for esse SHA, faça checkout do `headRefName`/`REVIEW_SHA`
  ou trabalhe só com o treeish remoto — o que importa é analisar o mesmo SHA
  que será o `commit_id` na publicação.
- Autor: `AUTHOR_LOGIN` = `.author.login` do `PR_JSON`. Mencione o autor
  sempre pelo handle GitHub real (`@<AUTHOR_LOGIN>`), nunca por nome próprio.
- Leia `AGENTS.md`, `ARCHITECTURE.md`, `CODE-PATTERN.md` e `MEMORY.md`.
  **Colete** (sem precisar reter no contexto principal) todas as discussões
  do PR — body, `comments` da Conversation, reviews e inline, com os ids das
  threads: elas são insumo da **lente 9**, que é a dona da deduplicação; o
  contexto principal só precisa do body/exceções documentadas.

## 1c. Contratos de API

Referência canônica do contrato do backend: a seção **Contrato de API** do
`CLAUDE.md` do projeto, que define `$API_CONTRACT_PATH` — um path local
(ex.: `docs/openapi.yaml`, pasta com vários YAMLs) ou uma URL de repositório
GitHub (`owner/repo/<path>@<branch>`). Leia a seção antes das lentes.

Borda de API = `*.request.ts`, `*.server.ts`, `endpoints.ts`, e `*.schema.ts`
**consumido por esses módulos** (schema de form local ou draft de
`sessionStorage` não é borda — mesmo predicado da pre-review). Diff tocando
borda **e** `$API_CONTRACT_PATH` definido: este setup é **obrigatório** antes
das lentes — liste os endpoints afetados pelo diff e obtenha a spec
correspondente (paths + schemas referenciados):

```bash
# path local
cat "$API_CONTRACT_PATH"            # ou os arquivos da pasta que cobrem os endpoints
# repositório GitHub (owner/repo/path@branch)
set -o pipefail
gh api "repos/<owner>/<repo>/contents/<path>?ref=<branch>" -q .content | base64 -d
```

Rejeite arquivo vazio/inválido antes de repassar (download "concluído" com
YAML vazio é falha, não contrato). A análise de divergência é da **lente 8**
(ver [lenses.md](lenses.md)), que recebe a spec (ou seus paths) e compara o PR
contra a doc sem re-inferir contrato a partir do próprio código.

Três casos de ausência:

- **Endpoint sem doc** (404 ou path ausente na spec): rode a lente 8 com o
  que obteve; a ausência é sinal, não infra — vira nota de "endpoint
  consumido sem documentação" recomendando sync na spec.
- **Spec inacessível** (repo sem acesso, path inexistente): pule a lente 8,
  registre no relatório (§6) e como ressalva no comentário geral (§5), e siga
  com as demais lentes. Em diff com borda de API, lente 8 não executada ⇒ a
  conclusão (§5) não pode ser `Approve` nem
  `Approve with non-blocking suggestions` — o contrato não verificado é
  pendência de merge.
- **`$API_CONTRACT_PATH` não definido** no `CLAUDE.md`: mesma rota da spec
  inacessível, e a ressalva recomenda definir a variável.

Diff sem borda de API → pule esta seção e a lente 8, e registre isso no
relatório (§6).

## 2. Ultracode — lentes via subagentes (obrigatório)

Em **qualquer host**: lentes 1–8 rodam **simultâneas** até o limite de
subagentes do host — o que não couber na leva entra assim que um slot
liberar; nunca serialize por escolha. A lente 8 só entra quando o §1c se
aplica (diff com borda de API e YAMLs baixados). Cada lente é uma passada
completa e independente em seu subagente; a lente 9 roda **sozinha, depois**,
recebendo a lista consolidada das anteriores. Não misture critérios de
lentes diferentes na mesma passada.
Detalhe: [lenses.md](lenses.md). Catálogo: [project-catalog.md](project-catalog.md).

**Sempre** use subagentes — um subagente **novo** por lente. Não rode lentes
no contexto principal “por praticidade”. Não reutilize subagente entre lentes.

### Modelo por host

Resolva o host (§0) e pin o modelo abaixo quando a API do host permitir.

| Host | Subagentes | Modelo / esforço |
|------|------------|------------------|
| **Claude Code** | tool **Workflow** (ultracode): todas as lentes num único workflow — 1–8 em paralelo, lente 9 como estágio seguinte recebendo a lista consolidada | **Opus 5** (`model: "opus"` nos agentes do workflow); nunca o tool Agent/Task |
| **Codex** | subagentes Codex (ver `.codex/skills/post-review/`): lentes 1–8 na maior leva que os slots permitirem (o que não couber entra quando liberar slot), lente 9 após todas | Herde o modelo e o reasoning da sessão; registre no relatório |
| **Cursor** | `Task` tool: as chamadas das lentes 1–8 na mesma mensagem (leva simultânea), lente 9 numa chamada própria depois | Herde o modelo da sessão; registre no relatório |

Se o host não expuser **subagente** de jeito nenhum, **pare e reporte**.
Falha só de pin de modelo: herde a sessão.
Não colapse lentes no contexto principal por praticidade.

### Prompt mínimo de cada subagente (lentes 1–8)

- Abra com o bloco **Stakes** de [lenses.md](lenses.md), verbatim: repo 100%
  agent-written, código de produção, este review é a única revisão antes dos
  usuários, e o subagente responde pelo que deixar passar.
- Postura adversarial: assuma que a mudança pode estar errada; pressione
  decisões; prefira achar risco real a absolver cedo.
- Diff: `origin/<base>...${REVIEW_SHA}` (o SHA pinado no §1); leia arquivo
  completo quando o hunk for ambíguo; rastreie callers se contrato/assinatura
  mudou.
- Só a lente N (não misturar).
- Devolver findings com: `path`, `line`, `side` (`RIGHT` para linha adicionada/
  modificada no head; `LEFT` para linha **só** no lado antigo / deleção),
  severidade preliminar, `evidenceClass` (`observed` ou `contractual`), fonte
  verificável, evidência, impacto concreto, e `causalRelation` obrigatório
  (`introduced` | `aggravated` | `exposed` | `pre-existing-unaffected` —
  a consolidação rejeita finding sem esse campo). Não devolver `inferred`
  como finding.
- Finding só de deleção sem linha RIGHT válida: marque `side: LEFT` ou
  `generalOnly: true` (cai no comentário geral).
- Devolver também o **atestado de cobertura**: lista dos arquivos do diff
  lidos por completo (ver [lenses.md](lenses.md)).
- Não publicar no GitHub; não editar código.

Extras por lente: as lentes 5–7 (Vercel) recebem o path de `VERCEL-OXLINT-MAPPING.md`
como rulebook (cada uma só com seus prefixos de regra); a lente 8 recebe os YAMLs (ou paths) baixados no §1c e o
estado de `gh pr checks`.

### Lente 9 (devil’s advocate)

Subagente novo, mesmo modelo do host (ou sessão herdada no Codex), recebe a
lista consolidada das lentes 1–8. Abra o prompt com o bloco **Stakes** de
[lenses.md](lenses.md), verbatim — para esta lente, a responsabilidade recai
sobre o **descarte errado**: absolver sem refutação fundamentada um finding
que depois causar dano em produção é atribuível a este filtro.
Recebe também o dump da discussão do PR coletado no §1 (Conversation +
reviews + inline, com thread-ids) — a sujeira fica no contexto descartável
deste subagente. Missão: **refutar** cada finding e **deduplicar**. Só
sobrevivem os que ainda têm evidência e impacto concreto após a refutação.

Deduplicação (dona: esta lente):

- **Entre lentes = fusão, não descarte**: mesmo arquivo + mesma causa-raiz →
  um finding só, com a evidência mais forte, citando as lentes de origem.
- **Contra comentário já publicado no PR**: devolva
  `{duplicateOf: <thread-id>, complement?: <texto curto>}`. `complement` só
  quando a justificativa nova muda algo material — evidência de classe mais
  forte, cenário de falha diferente, ou escalada de severidade; mesmo
  argumento com outras palavras = descarte puro, sem complemento.

Checklist de refutação: **único e definido em [lenses.md](lenses.md)
§ Lente 9** — as 6 perguntas gerais para todo finding, mais o sub-checklist
contratual condicional (só finding de contrato/backend). Regra única de
corte: refutação sem fonte não descarta.

## 3. Consolidação (contexto principal)

Reúna sobreviventes da lente 9 → releia cada um no código real em
`REVIEW_SHA`. Descarte de `blocker`/`high` feito pela lente 9 também chega
aqui com o motivo: releia o código antes de aceitar a absolvição — refutação
sem fonte não descarta. Depois, descarte só:

- Sem evidência. (Preexistente confirmado **não** é motivo de descarte:
  publica com causalidade `pre-existing-unaffected`; sem âncora válida no
  diff, vai ao comentário geral)
- Evidência apenas inferida: ausência de tratamento, possibilidade teórica ou
  exemplo de erro sem status/operação compatível não prova comportamento
  externo
- `duplicateOf` cujo thread-id não existe no PR (checagem leve — a dedup em
  si já foi feita pela lente 9; não re-leia a discussão inteira)
- Finding sem `causalRelation` válido (`introduced` | `aggravated` |
  `exposed` | `pre-existing-unaffected`): devolva à lente de origem ou
  classifique você relendo o código — não siga com o campo vazio
- Preferência estética pura (estilo sozinho)
- Sugestão que adiciona abstração sem pagar o custo
- Defeito de família de gate que o CI vermelho já aponta
  ([project-catalog.md](project-catalog.md) § "Famílias dos gates"; com CI
  verde, o mesmo defeito **fica** — vira violação + furo de gate)

Classifique: `blocker` | `high` | `medium` | `low`.

Publique todos os sobreviventes com evidência. Sem teto de “poucos”. Não
descarte `medium`/`high` por medo de volume.

Não publique como finding uma hipótese sobre o backend. Quando a dúvida for
útil, escreva no geral: “não confirmado; o contrato/docs não demonstram se X
ocorre; confirmar na spec em `$API_CONTRACT_PATH`/telemetria”. Essa nota não conta na
contagem de findings e não muda a conclusão do PR.

## 4. Comentários inline

Antes de postar:

1. Releia `headRefOid` atual do PR.
2. Se `headRefOid != REVIEW_SHA`, **aborte a publicação**, informe o drift e
   reinicie o review do zero no SHA novo — não publique findings do snapshot
   antigo contra o head novo.
3. Confirme: arquivo no diff desse SHA, `line`+`side` válidos, sem duplicata.

Formato (direto; uma menção ao autor por comentário; sem enrolação). As
**cinco** seções do template são obrigatórias em todo comentário inline, com
os rótulos verbatim: a evidência (o que o código faz hoje, com
arquivo/linha), **O que isso pode causar**, **Por que precisa ser
resolvido**, **Recomendação** e **Referência**. Finding que não consegue
preencher alguma com conteúdo específico não some: publica no comentário
geral (§5) com a lacuna nomeada ("sem Referência verificável: <por quê>") e
entra no §6 como "publicado sem seção X" — formatação nunca é o filtro final.

> `[severidade]` @\<AUTHOR_LOGIN\>, este trecho introduz
> `[problema específico]`.
>
> `[evidência: o que o código faz hoje, com arquivos/linhas]`
>
> **O que isso pode causar:** `[cenário concreto de falha/custo — input ou
> estado real → comportamento errado observável, quem é atingido]`
>
> **Por que precisa ser resolvido:** `[regra/padrão violado — AGENTS,
> CODE-PATTERN, ADR, id de regra Vercel, hard cutover, contrato — e o que
> acontece se ficar como está]`
>
> **Recomendação:** `[mudança concreta e proporcional]`
>
> **Referência:** `[fonte verificável — spec em $API_CONTRACT_PATH + linha, doc do
> repo + seção, VERCEL-OXLINT-MAPPING.md + regra, módulo equivalente]`

Exemplo preenchido (calibra o nível de detalhe esperado):

> [high] @autor, o histórico aninhado aceita só 2 ações enquanto o PR passa
> a gravar 4.
>
> O PR habilita a escrita de `NO_MOVEMENT` e `LEAD_REVERTED`
> (`crmLeadHistoryInputSchema`), mas `crmLeadHistorySchema` (histórico
> embutido no lead do board) mantém
> `picklist(["STAGE_CHANGED","DAY_ADVANCED"])`.
>
> **O que isso pode causar:** o primeiro lead com observação ou reativação
> derruba o parse de `crmLeadsSchema` inteiro — o board do CRM deixa de
> renderizar para todos os vendedores daquele funil, não só para o lead
> afetado.
>
> **Por que precisa ser resolvido:** o schema deixa de refletir o contrato
> real documentado na spec (AGENTS § Boundaries: não validar shape que o
> contrato não produz — nem o inverso, rejeitar shape que ele produz); o
> defeito é introduzido por este PR, que passa a gravar exatamente os
> valores ausentes.
>
> **Recomendação:** confirmar na spec qual enum o history
> aninhado devolve e, sendo os seis, alinhar `crmLeadHistorySchema` e o mapa
> de rótulos em `CrmLeadDialogSections.tsx:11` (hoje só cobre dois).
>
> **Referência:** `lead.yaml:2045` documenta dois valores, mas
> `lead-history-for-seller.yaml:578` documenta a entidade `History` com os
> seis; se `lead.yaml` estiver desatualizado, recomendar sync na spec.

Monte o payload **sem** interpolar texto do review em shell (sem heredoc
unquoted que expanda `\``, `$()`, variáveis). Grave JSON com `jq` e envie o
arquivo:

- Passe o texto por `jq --arg` ou `jq --rawfile`; não monte o JSON concatenando
  strings no shell.
- Não envie `\\n` esperando uma quebra de linha: isso chega ao GitHub como os
  caracteres literais `\\n`. O valor passado ao `jq` precisa conter quebras reais
  ou ser lido de um arquivo com `--rawfile`.
- Valide o arquivo antes do `gh api` com `jq -e . /tmp/post-review-payload.json`.

```bash
# REVIEW_SHA = SHA pinado no §1 (não re-buscar como fonte da verdade)
CURRENT=$(gh pr view <PR> --json headRefOid -q .headRefOid)
if [ "$CURRENT" != "$REVIEW_SHA" ]; then
  echo "PR head drifted: reviewed $REVIEW_SHA, now $CURRENT — abort/restart"
  exit 1
fi

jq -n \
  --arg commit "$REVIEW_SHA" \
  --arg body "$GENERAL_BODY" \
  --argjson comments "$COMMENTS_JSON" \
  '{commit_id:$commit, event:"COMMENT", body:$body, comments:$comments}' \
  > /tmp/post-review-payload.json

jq -e . /tmp/post-review-payload.json > /dev/null

gh api "repos/{owner}/{repo}/pulls/<PR>/reviews" --method POST \
  --input /tmp/post-review-payload.json
```

`COMMENTS_JSON` é um array JSON já serializado, cada item:

```json
{ "path": "<file>", "line": <n>, "side": "RIGHT"|"LEFT", "body": "<inline>" }
```

- `RIGHT` = linha no head (adição/modificação).
- `LEFT` = linha só no base (deleção).
- Sem âncora de linha válida → só no `body` geral do review.

Terceiro tipo de saída — **complemento de duplicata** (`duplicateOf` +
`complement` da lente 9): reply curto na thread original via
`gh api "repos/{owner}/{repo}/pulls/<PR>/comments/<id>/replies"` (mesma
disciplina de payload via `jq`), **citando quem fez o comentário original**
(handle do autor da thread; se o original tiver atribuição de review agent,
cite-a também):

> Complemento ao finding de @\<autor-original\> (`[atribuição original, se
> houver]`): `[o que mudou — evidência/cenário/severidade]`.
>
> — ${REVIEW_ATTRIBUTION}

No máximo **um** complemento por thread por run. Thread já resolvida não é
reaberta: o complemento vai ao comentário geral (§5) referenciando a thread
e citando o autor original da mesma forma.

Se a API rejeitar `line`/`side`, corrija com o diff do `REVIEW_SHA` ou mova
para o comentário geral. Nunca publique secrets. `event` sempre `COMMENT`
(nunca `APPROVE`).

## 5. Comentário geral

Escopo; áreas; contagem por severidade; riscos principais; padrões positivos;
condição do PR; o que deve ser corrigido antes do merge.

Conclusão explícita no texto:

- `Approve`
- `Approve with non-blocking suggestions`
- `Request changes`

A conclusão só pode ser da família `Approve` quando o review foi completo:
borda de API com lente 8 executada (§1c), cobertura sem furo persistente
(lenses.md § atestado). Qualquer uma dessas pendências ⇒ ressalva no texto e conclusão
`Request changes` (ou `Approve` com a pendência explícita como condição de
merge, nunca `Approve` limpo).

Feche com:

> Review conduzido por: `${REVIEW_ATTRIBUTION}`.

## 6. Relatório no terminal (após publicar)

- URL do PR
- Conclusão
- Contagem por severidade
- Arquivos comentados
- Qtd. de comentários inline publicados
- Findings descartados + motivo geral (incluindo absolvições de
  `blocker`/`high` pela lente 9 e o veredito da releitura)
- Duplicatas: fusões entre lentes, `duplicateOf` e complementos postados
- Findings publicados no geral com lacuna de seção ("publicado sem seção X")
- Cobertura: arquivos do diff que **nenhuma** lente listou no atestado, e o
  resultado da re-execução (lenses.md § atestado)
- Lentes 5–7 (Vercel) e lente 8 (contratos): rodaram ou por que foram puladas
- Host, modelo dos subagentes (ou “sessão herdada”), `REVIEW_SHA`,
  `REVIEW_ATTRIBUTION`

## Restrições

- Não modificar código / commit / push / auto-approve.
- Não publicar antes da lente 9 + consolidação.
- Comentário inline carrega as cinco seções do template (§4, rótulos
  verbatim); com lacuna, o finding vai ao comentário geral com a lacuna
  nomeada — nunca é dropado por formatação.
- Comentário **inline** só em linha do diff; defeito confirmado fora do diff
  (preexistente, caller quebrado) vai ao comentário geral.
- Não usar princípios como slogan — explique a violação.
- Não propor abstração especulativa; preferir solução direta menor.
- Estilo sozinho ≠ blocker. Complexidade / contrato / fallback / dual-path /
  regra de negócio no front = finding legítimo.
- Hard cutover: caminho duplo sem contrato externo aprovado é finding.
- Erro de backend no front → recomendar fix no backend, citando o contrato
  em `$API_CONTRACT_PATH`.
- Subagentes obrigatórios; sem colapsar lentes no main.
- Diff e publish amarrados ao `REVIEW_SHA` pinado; drift de head = abort.
- Texto do review nunca passa por expansão de shell.
