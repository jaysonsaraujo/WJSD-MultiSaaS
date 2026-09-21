---
name: check-review
description: >-
  Closes the review loop after the PR author answers a post-review: re-judges
  each justification or fix, resolves what holds, and approves with a human
  closing message when everything is settled. Use when the user asks for
  check-review, /check-review, or to verify/close the author's review replies.
---

# Check-review (fechamento)

Terceira etapa do ciclo de review. O autor do PR respondeu aos findings do
post-review — corrigindo com commits ou justificando por escrito — e esta
skill reavalia cada resposta, resolve o que se sustenta e fecha o review.
Resposta do autor é **claim, não veredito**: a régua continua sendo os
guardrails (`AGENTS.md`, catálogo do post-review, contratos), relidos contra o
código real no head atual.

| Skill | Quando | Saída |
|-------|--------|-------|
| `pre-review` | Antes de `gh pr create` | Relatório local + selo |
| `post-review` | PR aberto | Findings adversariais no GitHub |
| `do-review` | Findings publicados (lado do autor) | Fixes + justificativas nas threads |
| `check-review` | Autor respondeu aos findings | Threads resolvidas + ✅ ou pendências |

Roda no contexto principal, em **sessão separada** da que executou o
do-review — reviewer e autor no mesmo contexto anulam a separação que esta
etapa existe para dar. Se detectar que as respostas do autor saíram desta
mesma sessão, registre isso no relatório e no comentário de fechamento. Não
altere código, não commite, não faça push.

SHAs do ciclo: `REVIEW_SHA` = head do PR sendo julgado agora;
`REVIEWED_SHA` = `commit_id` do review do agent (o head que o post-review
inspecionou).

## 0. Atribuição e setup

Defina `REVIEW_ATTRIBUTION` pelo procedimento do post-review §0. Argumento:
número do PR (vazio = PR da branch atual).

Qualquer comando deste setup que falhe (HTTP, GraphQL, fetch) **interrompe a
skill com relatório do erro** — falha de consulta nunca vira "nenhuma
pendência".

```bash
git fetch origin --quiet
read -r OWNER REPO <<<"$(gh repo view --json owner,name -q '.owner.login + " " + .name')"
PR_JSON=$(gh pr view <PR> --json number,url,title,author,baseRefName,headRefName,headRefOid,body)
REVIEW_SHA=$(printf '%s' "$PR_JSON" | jq -r .headRefOid)
AUTHOR=$(printf '%s' "$PR_JSON" | jq -r .author.login)
git fetch origin "$(printf '%s' "$PR_JSON" | jq -r .headRefName)" --quiet \
  || { echo "head do PR inacessível (fork/branch removida) — pare e reporte"; }
# Reviews: ache o(s) review(s) do agent pela atribuição no body
gh api "repos/$OWNER/$REPO/pulls/<PR>/reviews" --paginate
# → AGENT_REVIEW_ID(s), REVIEWED_SHA = .commit_id, findings gerais = body
# Inline findings do review do agent (fonte da contagem-âncora)
gh api "repos/$OWNER/$REPO/pulls/<PR>/reviews/$AGENT_REVIEW_ID/comments" --paginate
# Threads com estado de resolução e respostas — pagine por pageInfo até
# hasNextPage=false em AMBAS as conexões antes de fechar o inventário
gh api graphql -F owner="$OWNER" -F repo="$REPO" -F pr=<PR> -f query='
  query($owner:String!,$repo:String!,$pr:Int!,$cursor:String){
    repository(owner:$owner,name:$repo){pullRequest(number:$pr){
      reviewThreads(first:100,after:$cursor){
        pageInfo{hasNextPage endCursor}
        nodes{id isResolved isOutdated path line
          comments(first:50){pageInfo{hasNextPage}
            nodes{databaseId author{login} body pullRequestReview{databaseId}}}}}}}}'
# Discussion (dedup e findings avulsos)
gh api "repos/$OWNER/$REPO/issues/<PR>/comments" --paginate
```

Monte o inventário com duas origens, ambas obrigatórias no placar:

- **Threads do agent**: threads cujo primeiro comentário pertence a um
  `AGENT_REVIEW_ID` (`pullRequestReview.databaseId`). Entram as
  `isResolved: false` **e** as `isResolved: true` cuja resolução não veio de
  resposta do próprio reviewer num ciclo anterior — resolvida por fora, volta
  como pendente até re-julgamento.
- **Findings gerais**: itens do body do review do agent sem thread própria
  (inclusive `generalOnly` de deleção). São julgados como os demais; a
  resposta deles sai no comentário de fechamento.

**Âncora positiva**: a soma `threads do agent + findings gerais` deve bater
com a contagem publicada pelo post-review (contagem por severidade no body).
Total zero ou divergência sem explicação ⇒ pare e reporte — **nunca** siga
para approve com inventário vazio ou furado.

Threads de outros revisores **humanos** não são julgadas nem resolvidas aqui;
as que estiverem abertas entram no placar como pendência que bloqueia o ✅.


## 1. Reavaliar cada item do inventário

Julgue cada item com o código real **no `REVIEW_SHA`**: se
`git rev-parse HEAD` == `REVIEW_SHA`, a working tree serve; senão leia via
`git show "$REVIEW_SHA:<path>"` — nunca julgue contra uma working tree em
outro estado. Thread `isOutdated`: `path`/`line` não valem mais — localize o
código sucessor via `git diff $REVIEWED_SHA..$REVIEW_SHA` antes de julgar;
fix que tornou a thread obsoleta conta como corrigido.

O eixo da classificação é a **situação do código**, não só a resposta
escrita:

- **Corrigido** — o defeito não existe mais no `REVIEW_SHA` (com ou sem
  resposta escrita do autor). Confirme que a mudança resolve, não silencia
  (mover o fallback de lugar não é resolver). Correção que enfraquece um gate
  reabre o finding como `blocker` (ADR-021).
- **Justificado sem mudança** — aceite apenas justificativa ancorada em algo
  verificável: exceção documentada (ADR, discussão no PR, contrato externo
  aprovado), requisito real citado, ou demonstração de que a leitura do
  finding estava errada. "É intencional", "fica pra depois" ou "sempre foi
  assim" não sustentam sozinhos. Em regra de negócio/contrato, confira a
  fonte citada (doc de contratos do post-review §1c, ADR em `MEMORY.md`).
- **Pendente** — nem o código no `REVIEW_SHA` nem alguma resposta escrita
  endereçam o finding. Não cobre por thread; apenas liste no fechamento.
  Resposta parcial ou de terceiro julga-se pelo mesmo eixo: vale o estado do
  código mais a melhor justificativa presente.

**Código novo não revisado**: rode `git diff --stat $REVIEWED_SHA..$REVIEW_SHA`
e compare com os fixes esperados. Mudança além de responder aos findings
(arquivos ou áreas novas) entra no placar como pendência: recomende um
post-review novo antes do ✅.

Critério de conclusão: **todo** item do inventário (threads + findings
gerais) classificado em aceito, rejeitado ou pendente, com a evidência que
sustenta o julgamento — e a âncora positiva do §0 conferida.

## 2. Placar e confirmação — antes de qualquer publicação

Apresente ao usuário o placar completo (aceitos / rejeitados / pendentes /
threads humanas abertas / código novo) e o plano de publicação.
Nenhuma resposta, resolução ou approve antes desta apresentação — resolver
thread é irreversível na prática e não pode preceder a decisão de que o PR
talvez precise de outro post-review. **Aprovar exige confirmação do
usuário**; com o plano confirmado, as respostas de thread saem direto.

Imediatamente antes de publicar qualquer coisa, re-cheque o head:

```bash
CURRENT=$(gh pr view <PR> --json headRefOid -q .headRefOid)
[ "$CURRENT" = "$REVIEW_SHA" ] || { echo "head drifted — reinicie o ciclo no SHA novo"; }
```

Drift ⇒ aborte a publicação e reinicie o julgamento no head novo.

## 3. Responder e resolver

Escreva como um colega que releu o código, não como um bot: mensagens curtas,
específicas sobre o que convenceu (ou não), variando a redação entre threads —
nunca o mesmo texto colado N vezes. Uma menção ao autor por comentário no
máximo; nas threads, o contexto já diz com quem você fala.

- **Aceita** — responda em tom descontraído de colega zoando de leve, sempre
  citando o que resolveu, e feche com ✅. O vibe é este (varie, não cole):
  "mandou bem, tá afiado nos prompts em? kkkk ✅✅✅" /
  "boa demais, o `revalidatePath` ali matou o problema, sem choro kkk ✅" /
  "ok ok, com o ADR citado você me convenceu, segue o jogo ✅✅" /
  "aí sim, hard cutover de verdade — o caminho velho nem deixou saudade kkk ✅" /
  "apagou o wrapper inteiro em vez de discutir, respeito kkkk ✅✅" /
  "justificativa redondinha, contrato batendo com a doc, não tenho nem o que
  reclamar ✅" /
  "kkkk tá certo, eu que li errado o fluxo aqui — finding meu, revogado ✅" /
  "teste de regressão no lugar, agora esse bug não volta nem por engano ✅✅✅" /
  "fallback removido, schema segurando sozinho — era isso mesmo, bonito ✅" /
  "tá bem feito, parece IA ( ͡° ͜ʖ ͡°) ✅" /
  "hmm 🧐 li com má vontade e mesmo assim não achei defeito, aprovado 😎 ✅" /
  "🤨 vim pronto pra discutir e você me desarmou com a doc do contrato, ok ✅✅" /
  "resolveu tão rápido que nem deu tempo de eu abrir o café kkkk ✅" /
  "esse diff ficou tão limpo que dá até pra mostrar no daily 😎✅✅✅" /
  "confesso que dei zoom esperando um `?? 0` escondido... nada 🧐 ✅".

  Publique a resposta, **verifique o retorno** e só então resolva:

  ```bash
  # <rootId> = databaseId do PRIMEIRO comentário da thread (a API de replies
  # só aceita o raiz). Um arquivo por thread, escrito imediatamente antes.
  gh api "repos/$OWNER/$REPO/pulls/<PR>/comments/<rootId>/replies" \
    --method POST -F body=@/tmp/check-review-reply-<threadId>.md
  # Reply retornou id? Só então:
  gh api graphql -f query='mutation($t:ID!){
    resolveReviewThread(input:{threadId:$t}){thread{isResolved}}}' -f t=<threadId>
  ```

  Reply que falhar (id errado, permissão, HTTP) ⇒ **não** resolva a thread;
  ela vira pendência no relatório (§4). Thread resolvida sem resposta
  registrada é exatamente o estado que este fluxo proíbe.

- **Rejeitada** — responda explicando por que a justificativa não fecha, com
  a evidência (arquivo:linha no `REVIEW_SHA`, regra ou contrato), e o caminho
  concreto para destravar. A thread fica aberta.

- **Findings gerais** aceitos/rejeitados: o veredito de cada um vai no
  comentário de fechamento (§3b), item a item.

### 3b. Fechamento

- **Tudo aceito** (nenhum rejeitado nem pendente, sem thread humana aberta,
  sem código novo não revisado):
  após a confirmação do §2, feche com approve e uma mensagem humana ao
  autor — direta, reconhecendo o trabalho, citando 1–2 pontos que melhoraram
  de verdade. Exemplo de tom (adapte, não cole):

  > @<autor>, revisitei todos os pontos do review — as correções fecharam e as
  > justificativas se sustentam. Gostei especialmente de <ponto concreto>.
  > Pelo lado do review, está liberado ✅
  >
  > — ${REVIEW_ATTRIBUTION}

  ```bash
  gh pr review <PR> --approve --body-file /tmp/check-review-closing.md
  ```

- **Sobrou qualquer pendência** — sem approve. Publique um comentário geral
  resumindo o que já fechou e o que ainda falta (item a item, com o porquê),
  no mesmo tom humano, encerrando com a atribuição.

## 4. Relatório no terminal

URL do PR; placar aceitos/rejeitados/pendentes (threads + findings gerais);
threads resolvidas; replies que falharam; approve publicado ou motivo de não
aprovar; `REVIEW_SHA`, `REVIEWED_SHA`; `REVIEW_ATTRIBUTION`; se autor e
reviewer compartilharam a sessão.

## Restrições

- Não modificar código / commit / push.
- Falha de consulta no §0 interrompe com relatório — nunca vira inventário
  vazio nem "tudo aceito".
- Approve só com âncora positiva conferida, todos os itens do inventário
  aceitos, nenhuma thread humana aberta, head sem drift e
  confirmação do usuário.
- Resolver thread só após o reply correspondente retornar sucesso.
- Threads de revisores humanos ficam intactas (mas abertas bloqueiam o ✅).
- Texto de review nunca passa por expansão de shell (sempre `-F body=@file`).
