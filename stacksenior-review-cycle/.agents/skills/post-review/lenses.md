# Lentes ultracode (post-review)

## Stakes (abre o prompt de TODA lente, verbatim)

> Este repo é construído com agentes de IA e este review é a última revisão
> técnica que o PR recebe antes do merge: o que passar aqui chega ao usuário
> em produção. Você é o responsável por qualquer
> falha que passar por esta lente: um defeito não identificado aqui que
> causar dano aos usuários é atribuível a este review. Não existe "alguém
> depois de mim vai pegar". Prefira pressionar demais a absolver cedo.

Review **adversarial**: lentes 1–8 pressionam; lente 9 é o único filtro.
Cada lente é uma passada completa em subagente próprio. Critério: *esta
complexidade é necessária para o requisito atual, ou cabe uma implementação
menor, explícita e testável?*

Além dos findings, cada lente de 1–8 devolve um **atestado de cobertura**: a
lista dos arquivos do diff que leu por completo (a lente 9 recebe findings, não
o diff — fica fora do atestado). Atestado parcial por lente é esperado; o furo
é o arquivo do diff que **nenhuma** lente listou. Furo detectado → re-rode a
lente mais pertinente num subagente novo cobrindo os arquivos faltantes;
persistindo, o furo vira ressalva obrigatória no comentário geral (§5) e a
conclusão não pode ser `Approve` limpo — além da linha no relatório (§6).

## Lente 1 — Arquitetura e simplicidade

- Over-engineering; KISS; YAGNI; SOLID; SRP
- Camadas / adapters / factories / providers / services sem justificativa
- Abstrações prematuras; acoplamento; responsabilidades misturadas
- Complexidade acidental; inconsistência com
  `app → features → lib → shared → externo`
- Fragmentação (módulo de um importer, wrapper fino de `apiClient`,
  literal-dispatch de um caller)
- Stopgap “funciona agora, troca depois”
- Regra de negócio / authz inventada no frontend

## Lente 2 — React e frontend

- Componentes declarados/aninhados dentro de outros
- Componentes grandes; UI misturada com regra de negócio
- Hooks com responsabilidades demais; estado derivado armazenado
- `useEffect` de sincronização evitável; prop drilling excessivo
- Re-renders evitáveis; composição ruim; JSX ilegível
- Condicionais espalhadas; padrão diferente do módulo equivalente
- `form.watch()` / `watch()` no corpo do componente
- Nested client boundary desnecessário; lógica pesada em `.tsx`
- Antipatterns minerados: `key={id ?? index}`, `useState` seed-once da URL,
  a11y de mentira (`<tr onClick>`, `<dialog open>`, nome só em `hidden md:inline`)

## Lente 3 — Fluxos, erros e fallbacks

- Fallbacks excessivos / silenciosos; defaults que mascaram dado inválido
- `catch` amplo; erro ignorado; retorno silencioso
- Fluxos alternativos difíceis de rastrear; estados impossíveis
- Defesa exagerada; compat retroativa sem necessidade
- Falha convertida em sucesso; envelope `{ success, message, data? }` desconfiado
  após schema
- `?? ''` / `|| []` / `?? 0` / `Math.max(1, x)` em shape garantida
- Workaround de erro do backend no frontend (contrato canônico em `$API_CONTRACT_PATH`)
- searchParam renderizado como mensagem de produto
- URL self-emitted inválida sem `redirect`/404 (fallback silencioso)

## Lente 4 — Legibilidade e manutenção

- Spaghetti; funções longas; condicionais profundamente aninhadas
- Duplicação (bloco com dono existente não reutilizado)
- Nomes ruins (`data`, `item`, `helper`); helpers de um único caso
- Mutabilidade confusa; dependências implícitas; fluxo não linear
- Comentário/JSDoc que justifica complexidade ou cita migração passada
- Dificuldade de teste / remoção futura
- Campo populado sem leitor no mesmo PR
- Literal de catálogo/registry solto em `if`/`===`/paths

## Lentes 5–7 — Performance (Vercel)

Rulebook comum e **fonte única**: `VERCEL-OXLINT-MAPPING.md` § "Regras
arquiteturais (SEM equivalente de linter)" — a lista completa das regras de
`vercel-react-best-practices` que o oxlint não prova, já com as divergências
decididas deste repo (adaptações, inversões e N/A) e o padrão que cada id
descreve. Os bullets das lentes abaixo delimitam **escopo e ownership**; a
semântica de cada regra vem do mapping. Cada finding cita o **id da regra
Vercel** como fonte verificável (`evidenceClass: contractual`). O que está na
tabela "oxlint = error" do mapping é família de gate (catálogo § "Famílias dos
gates") — não duplique o CI.

## Lente 5 — Vercel: Waterfalls & Server (`async-*`, `server-*`)

- Awaits sequenciais de I/O independente **fora de loop** (`async-parallel`)
- I/O aguardado antes de early return / ramo que não usa o resultado
  (`async-defer-await` — pode ser um único await)
- Condição barata depois do await (`async-cheap-condition-before-await`);
  promise iniciada tarde em route handler (`async-api-routes`); dependências
  parciais sem paralelizar o que independe (`async-dependencies`)
- Streaming: conteúdo lento sem boundary (`async-suspense-boundaries` —
  `loading.tsx` já é boundary; exceções da regra no mapping)
- Siblings serializados sem composição (`server-parallel-fetching`)
- Fetch dependente esperando o `Promise.all` do nível anterior inteiro —
  encadear pai→filho por item (`server-parallel-nested-fetching`)
- Server Action que muta **sem repassar a credencial** ao backend via
  `next/headers`, ou que decide permissão localmente (`server-auth-actions`
  adaptada — ver mapping; cite AGENTS § Auth junto)
- Trabalho assíncrono **não-fetch** (auth/DB/computação) duplicado no mesmo
  request sem `React.cache()` (`server-cache-react`)
- Objeto grande RSC→client para poucos campos (`server-serialization`)
- Mesmo dado em props com referências diferentes — transformação no RSC
  (`server-dedup-props`)
- Estado mutável em módulo com dado de request (`server-no-shared-module-state`)
- I/O estático não hoisted (`server-hoist-static-io`); pós-processamento
  bloqueante sem `after()` (`server-after-nonblocking`)
- Inversão do `server-cache-lru`: cache cross-request em memória = finding
  **blocker** (stale cache é estritamente proibido)

Severidade: waterfalls = **high**; server = **high/medium** — exceto stale
cache (`server-cache-lru` invertida), vazamento cross-request
(`server-no-shared-module-state`) e mutação sem credencial repassada ao
backend (`server-auth-actions` adaptada), que sobem a **blocker**.

## Lente 6 — Vercel: Bundle & Client (`bundle-*`, `client-*`)

- Código pesado **não necessário no primeiro render**, ativado sob
  interação/feature, importado estático (`bundle-dynamic-imports`,
  `bundle-conditional` — UI do primeiro render ou já isolada pelo chunk da
  rota fica como está)
- Third-party (analytics/logging) carregado antes da hydration ou síncrono
  (`bundle-defer-third-party`)
- Sem preload em intenção do usuário (hover/focus) onde a percepção paga
  (`bundle-preload`); path de import/fs não analisável estaticamente além do
  alcance do lint (`bundle-analyzable-paths`)
- Listeners globais duplicados entre instâncias (`client-event-listeners` —
  só o resíduo de dedup; fix = listener único em módulo, ver mapping)
- `touch*`/`wheel` sem `passive` quando o handler não usa `preventDefault()`
  — e `passive` em gesto que precisa cancelar o evento
  (`client-passive-event-listeners`, os dois sentidos)
- localStorage sem chave versionada, com token/PII ou payload além do usado,
  ou leitura/escrita fora de try-catch (`client-localstorage-schema` — os
  três contratos)
- Barrels e fetch de dados no client são famílias de gate — não duplique

Severidade: `bundle-dynamic-imports`/`bundle-conditional`/
`bundle-analyzable-paths` = **high**; `bundle-preload`/
`bundle-defer-third-party` e `client-*` = **medium**.

## Lente 7 — Vercel: Re-render, Rendering & JS (`rerender-*`, `rendering-*`, `js-*`, `advanced-*`)

- Estado derivado: `rerender-derived-state-no-effect` é família de gate
  (`boilerplate/no-derived-state-in-effect`) — aqui só o resíduo que a regra não
  vê (derivação em handler/callback, estado espelhado); subscribe a valor
  cru quando só o boolean derivado importa (`rerender-defer-reads`,
  `rerender-derived-state`)
- Effect com dep de objeto quando só um campo primitivo é lido
  (`rerender-dependencies` — `exhaustive-deps` aceita `[user]`)
- Init caro sem lazy `useState` (`rerender-lazy-state-init`); setState não
  funcional onde a identidade importa (`rerender-functional-setstate`)
- Update não urgente sem transition (`rerender-transitions`,
  `rendering-usetransition-loading`); input travado sem `useDeferredValue`
  (`rerender-use-deferred-value`)
- Valor frequente **não exibido**/DOM-adjacente em state
  (`rerender-use-ref-transient-values` — valor que dirige JSX fica em state;
  movê-lo para ref deixa a UI stale, também é finding)
- Interação (submit/click/drag) modelada como state + effect em vez de
  **handler** (`rerender-move-effect-to-event` — `useEffectEvent` não
  substitui mover a lógica); callback reativo em deps re-subscrevendo
  effect/subscription a cada render → recomendar `useEffectEvent`
  (`advanced-use-latest`, forma canônica); hook monolítico com deps
  independentes (`rerender-split-combined-hooks`)
- Prop default não-primitiva por **chamada de função**
  (`rerender-memo-with-default-value` — só esse resíduo: literais e `new`
  são gate, `react/no-object-type-as-default-prop`)
- Trabalho caro sem componente próprio para o compiler ganhar granularidade
  (espírito de `rerender-memo`, **sem** memo manual)
- `{lista.length && <X/>}` (leaked render, `rendering-conditional-render` —
  o mapping documenta que o oxlint não cobre)
- Hydration: flicker de dado client-only sem inline script
  (`rendering-hydration-no-flicker`); `suppressHydrationWarning` fora do uso
  estrito
- Lista longa sem `content-visibility` (`rendering-content-visibility`);
  componente **caro** alternando visibilidade com frequência, com estado que
  deve sobreviver ao hide, sem `Activity` (`rendering-activity` — unmount
  como reset deliberado fica como está; `Activity` onde o reset era desejado
  também é finding); resource hints ausentes (`rendering-resource-hints`);
  SVG animado direto / precisão excessiva (`rendering-animate-svg-wrapper`,
  `rendering-svg-precision`)
- `js-*` como princípio: iterações combinadas, index maps, early exit, cache
  de leitura de storage, `requestIdleCallback` para trabalho não crítico;
  `js-cache-function-results` só função pura. `advanced-init-once` para
  init de app único.

Severidade: rerender/rendering = **medium**; `js-*` = **low**.

## Lente 8 — Contratos de API (`$API_CONTRACT_PATH`)

Só roda quando o diff toca borda de API **e** o projeto define
`$API_CONTRACT_PATH` (§1c); sem uma das duas, a lente é pulada e isso vai ao
relatório. Recebe a spec OpenAPI obtida no §1c (paths + schemas) e compara o
PR contra a doc — **nunca** re-infere contrato a partir do próprio código do PR.

- Método/path divergente; param de query obrigatório/opcional trocado
- Shape de `data` no envelope `{ success, message, data? }`: campos, enums,
  nullabilidade, paginação
- Campo validado no schema do PR que não existe na doc
- Narrowing/fallback defensivo pra shape que o contrato não produz
  (AGENTS § Boundaries)
- Re-derivação no front de campo que a API já tipou/normalizou
- Divergência que quebra request/parse em runtime = `blocker`; demais = `high`
- Suspeita de doc desatualizada frente ao backend: não absolve o PR — finding
  vira nota recomendando sync na spec em `$API_CONTRACT_PATH`
- Cite sempre arquivo YAML + trecho como evidência

## Lente 9 — Devil's advocate (filtro, não suavizador)

Dona da **deduplicação** (recebe o dump da discussão do PR com thread-ids):

- Entre lentes: mesma causa-raiz no mesmo arquivo → **fusão** num finding só
  (evidência mais forte, lentes de origem citadas), nunca descarte de um dos
  dois — defeito achado por duas lentes independentes é confiança, não ruído.
- Contra comentário já publicado: marque `duplicateOf: <thread-id>` e
  devolva também o **autor do comentário original** (handle e, se houver,
  a atribuição de review agent no texto) — a publicação (§4) cita ambos no
  complemento; adicione `complement` **só** se a justificativa nova muda
  algo material (evidência de classe mais forte, cenário de falha diferente,
  escalada de severidade).

Para cada finding das lentes 1–8, tente **refutar**:

1. Qual é a relação causal com o PR: `introduced`, `aggravated`, `exposed` ou
   `pre-existing-unaffected`? “Já existia” sozinho não é refutação.
2. A complexidade é exigida por requisito real / doc / ADR?
3. É só preferência estética / estilo sem impacto?
4. A recomendação causaria regressão?
5. Segue padrão consolidado do projeto?
6. Há evidência suficiente (`path`/`line`/`side` + impacto concreto) para publicar?

Sub-checklist **condicional** — só para finding de contrato/backend (lente 8
ou evidência sobre comportamento do backend); evidência de performance é call
graph, ordem de awaits, fronteira RSC/Suspense ou rendering observável, e não
passa por estas perguntas:

- A evidência é `observed` ou `contractual`, com fonte verificável?
- O material prova o comportamento alegado, ou só prova que o frontend não o
  trata?
- O status/payload está ligado à operação afetada, ou é apenas exemplo de
  outro status/operação? Não confirmado → descarte do finding contratual;
  registre a pergunta separadamente, sem severidade de merge.

Todo descarte nomeia **qual** pergunta falhou **e** a evidência da refutação
(linha, doc, contrato) — refutação sem fonte não descarta. Descarte de
`blocker`/`high` não é final: vai à consolidação como "descartado pela lente 9
+ motivo", e o contexto principal relê o código antes de aceitar a absolvição.

Elimine falso positivo e nitpick **sem impacto**. Não absolva complexity /
contrato / fallback / dual-path / regra de negócio no front só para reduzir
volume. O que sobreviver com evidência deve ser publicado. Deleção sem linha
RIGHT válida usa `LEFT` ou cai no comentário geral.

Todo defeito confirmado deve ser publicado como finding normal, inclusive
`pre-existing-unaffected`. A causalidade explica quem introduziu o problema;
não reduz a severidade, não muda a recomendação e não autoriza descarte. Se o
PR torna o caminho alcançável, remove uma proteção ou amplia o impacto,
classifique como `exposed` ou `aggravated`, mas publique com a mesma régua.
