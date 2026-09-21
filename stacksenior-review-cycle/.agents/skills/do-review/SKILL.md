---
name: do-review
description: >-
  Author-side answer to a PR review: triages each finding with the user, fixes
  what is accepted, justifies what is contested, and replies on every thread.
  Use when the user asks for do-review, /do-review, or to address/answer the
  review comments on a PR.
---

# Do-review (cumprir o review)

Lado do **autor** no ciclo de review: pega os findings publicados no PR,
discute cada um com o usuário e cumpre — corrige o acatado, justifica o
contestado e responde em toda thread. É a etapa entre o `post-review` (que
publica os findings) e o `check-review` (que julga as respostas e fecha).

| Skill | Papel | Quando |
|-------|-------|--------|
| `post-review` | Reviewer | Publica findings no PR |
| `do-review` | Autor | Responde aos findings: fix ou justificativa |
| `check-review` | Reviewer | Julga as respostas e fecha com ✅ |

Roda no contexto principal — a discussão com o usuário é parte do fluxo, não
um extra. Nunca resolva threads: quem resolve é o reviewer (`check-review`,
de preferência em **sessão separada** desta — autor julgando as próprias
respostas anula a separação do ciclo).

Assinatura: defina `AUTHOR_ATTRIBUTION` = "<host resolvido pelo post-review
§0> (autor do PR)". Nunca assine como `REVIEW_ATTRIBUTION` — esse selo
identifica o reviewer, e o check-review recorta threads por ele.

## 0. Setup

Argumento: número do PR (vazio = PR da branch atual). Qualquer comando deste
setup que falhe (HTTP, GraphQL, fetch) **interrompe a skill com relatório do
erro** — falha de consulta nunca vira "nenhum finding a responder".

```bash
git fetch origin --quiet
read -r OWNER REPO <<<"$(gh repo view --json owner,name -q '.owner.login + " " + .name')"
PR_JSON=$(gh pr view <PR> --json number,url,title,baseRefName,headRefName,headRefOid)
PR_HEAD=$(printf '%s' "$PR_JSON" | jq -r .headRefOid)
[ "$(git rev-parse HEAD)" = "$PR_HEAD" ] \
  || { echo "checkout local != head do PR — rode gh pr checkout <PR> ou pare e reporte"; }
# Threads — pagine por pageInfo até hasNextPage=false nas duas conexões
gh api graphql -F owner="$OWNER" -F repo="$REPO" -F pr=<PR> -f query='
  query($owner:String!,$repo:String!,$pr:Int!,$cursor:String){
    repository(owner:$owner,name:$repo){pullRequest(number:$pr){
      reviewThreads(first:100,after:$cursor){
        pageInfo{hasNextPage endCursor}
        nodes{id isResolved path line
          comments(first:50){pageInfo{hasNextPage}
            nodes{databaseId author{login} body}}}}}}}'
# Reviews (bodies carregam findings gerais) e Conversation
gh api "repos/$OWNER/$REPO/pulls/<PR>/reviews" --paginate
gh api "repos/$OWNER/$REPO/issues/<PR>/comments" --paginate
```

Escopo: toda thread `isResolved: false` sem resposta final do autor — de
review agent ou de revisor humano — **mais** os findings publicados só no
body de um review ou em comentário da Conversation. Tudo entra no mesmo
inventário da triagem; a resposta dos itens sem thread sai num comentário
geral.

## 1. Triagem com o usuário

Para cada finding, forme **seu** juízo antes de perguntar: releia o arquivo
real, confira a regra citada (`AGENTS.md`, catálogo do post-review, contrato
em `$API_CONTRACT_PATH`) e classifique em:

- **Acatar** — o finding procede; proponha a correção concreta.
- **Contestar** — o finding não procede; proponha a justificativa e a âncora
  verificável que a sustenta (ADR, contrato, requisito, leitura errada do
  reviewer com a evidência).
- **Discutir** — genuinamente ambíguo.

Apresente o placar com sua recomendação por finding e colha a decisão do
usuário (em lote para os consensuais; um a um só nos "discutir"). A decisão
final é do usuário; a sua recomendação vem primeiro.

Critério de conclusão: **todo** finding do inventário com decisão
registrada — acatar ou contestar — antes de tocar em código.

## 2. Cumprir

- **Acatados**: aplique as correções na working tree seguindo os guardrails —
  menor mudança de boundary, hard cutover, sem enfraquecer gate para o fix
  passar (ADR-021; correção que afrouxa gate será reaberta como blocker no
  check-review). Bugfix apontado no review ganha teste de regressão quando
  prático.
- **Contestados**: escreva a justificativa que sobreviveria ao check-review —
  ancorada no verificável, citando a fonte (ADR-0NN, YAML do contrato,
  discussão no PR). "É intencional" sozinho vai ser rejeitado lá.
- Commits por domínio coeso, mensagem citando o review
  (ex.: `fix(<área>): resolve findings do review #<PR>`). Push após confirmar
  com o usuário — o `verify` roda no pre-push.

Caminhos não-felizes do push, ambos com procedimento:

- **`verify` vermelho / push falhou** → volte ao §2 e corrija; nenhuma
  resposta é publicada citando commit que não está no remoto.
- **Usuário adiou o push** → publique só as respostas de contestação;
  relate "respostas de fix pendentes de push" no §4 e encerre. Nunca cite
  short-sha local que o remoto não tem.

## 3. Responder nas threads

Depois do push (as respostas de fix citam o commit real), responda **toda**
thread do escopo, voz de autor: direta, específica, sem se defender além do
necessário.

- **Corrigido** — o que mudou e onde: "corrigido em `<short-sha>` — <mudança
  concreta>". Nada de prometer fix futuro: ou corrigiu neste ciclo, ou é
  contestação.
- **Contestado** — a justificativa do §2 com a âncora citada.

Corpo sempre por arquivo, um por thread — texto de review nunca passa por
expansão de shell. O id do endpoint é o `databaseId` do **primeiro**
comentário da thread (a API de replies só aceita o raiz); erro HTTP na
resposta ⇒ registre a thread como não-respondida no §4, não siga em silêncio:

```bash
gh api "repos/$OWNER/$REPO/pulls/<PR>/comments/<rootId>/replies" \
  --method POST -F body=@/tmp/do-review-reply-<threadId>.md
```

Findings sem thread (body de review / Conversation): uma resposta única no
Conversation cobrindo cada item, mesmo formato. Feche cada resposta longa
(geral ou contestação) com `— ${AUTHOR_ATTRIBUTION}`.

## 4. Relatório no terminal

URL do PR; placar acatados/contestados; commits criados e push feito ou
pendente; threads respondidas e as que falharam; sugestão de rodar
`/check-review` **em sessão nova** para o reviewer fechar o ciclo.

## Restrições

- Nunca resolver thread nem aprovar o PR — isso é do reviewer.
- Falha de consulta no §0 interrompe com relatório — nunca vira "nenhum
  finding".
- Nenhuma edição de código antes da triagem completa com o usuário (§1).
- Push só com confirmação do usuário; resposta de fix só depois do push.
- Correção não enfraquece gate (ADR-021); contestação sem âncora verificável
  volta para a triagem, não vai para o PR.
- Assinatura de autor é `AUTHOR_ATTRIBUTION`; `REVIEW_ATTRIBUTION` é do
  reviewer.
- Texto de review nunca passa por expansão de shell (sempre `-F body=@file`).
