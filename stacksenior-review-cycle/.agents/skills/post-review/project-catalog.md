# Catálogo do projeto (post-review)

Complementa as lentes genéricas com o que AGENTS / ARCHITECTURE / CODE-PATTERN /
hooks mineraram. Cite a regra no comentário quando aplicável.

## Must-flag (genérico ultracode costuma perder)

| Check | Por quê |
|-------|---------|
| Contrato ou tipo de uma feature importado por outra feature (deveria `lib`/`shared`) | ARCHITECTURE |
| Brand/contato/marketing em `lib/api` + prop-drill | AGENTS Boundaries |
| Um arquivo/request por endpoint dentro da mesma feature (fragmentação) | CODE-PATTERN §9 |
| Fallback/narrowing pós-schema **fora** de try/catch de parse — `?? []`, `if (!data)` após validação (o gate só vê catch que engole parse) | AGENTS + CODE-PATTERN §9; resíduo de `no-defensive-parse` |
| Literal de id de catálogo em arquivo que **não importa** o registry (o gate só vê registry em escopo) | AGENTS Senior; resíduo de `no-catalog-id-literal` |
| Período/métrica/status/tom/ranking derivado no front | AGENTS; inject-patterns |
| English `id` em URL pública | AGENTS URLs |
| Segunda parse de searchParam que o app emitiu | AGENTS Senior |
| Dual-path / flag de compat / adapter de shape morta | Hard cutover |
| Workaround de `success:false` / HTTP não-2xx | AGENTS Rewrite |
| JWT decode; authz via `user_role`/`authorities`; `document.cookie`; `middleware.ts` | AGENTS Auth |
| Normalizer em RSC props / catálogo já tipado | AGENTS Senior |
| Extração genérica com <3 callers (exceto primitivo `shared` concreto) | Regra 1/2/3 |
| searchParam como copy; `key={id??index}`; seed-once URL; a11y fake; JSDoc de migração; colar em vez de importar | inject-patterns |
| Campo novo sem consumidor no PR | reinforce-patterns |
| `oxlint-disable` / exclusão de regra | AGENTS Runtime |
| Gate enfraquecido no diff: regra de lint desativada, hook de `tooling/agent-hooks/` editado, `verify` afrouxado, seal/ack gravado por fora | ADR-020/ADR-021 |
| API Next/React no padrão pré-Next 16 (conferir `node_modules/next/dist/docs`) | AGENTS topo |
| Bugfix sem teste de regressão quando prático | pre-review §G |
| Awaits sequenciais de I/O independente **fora de loop** em RSC/Server Action | Vercel `async-parallel` |
| Server Action que muta sem repassar credencial ao backend / decide permissão localmente | Vercel `server-auth-actions` adaptada; AGENTS Auth |
| RSC→client serializando objeto inteiro para poucos campos | Vercel `server-serialization` |
| `{lista.length && <X/>}` (leaked render — sem regra no oxlint) | Vercel `rendering-conditional-render` |
| Código pesado não necessário no 1º render, ativado sob interação/feature, importado estático | Vercel `bundle-dynamic-imports` |
| Divergência código × spec em `$API_CONTRACT_PATH` (método/path/enum/nullabilidade) | Lente 8; §1c |

## Severidade (heurística deste rewrite)

**blocker** — workaround de backend; regra/authz/preço inventados no front; JWT /
authz por cookie público; dual-path de compat sem contrato externo aprovado;
searchParam como mensagem de produto; suppress de lint como “fix”; stale
cache em qualquer forma — cache cross-request em memória (LRU/Map de módulo
com dado de backend) incluído; qualquer
gate enfraquecido para o PR passar (ADR-021).

**high** — fallback silencioso em shape garantida; `catch` que fabrica sucesso;
re-derivação de domínio; literal de URL/catálogo; hard cutover incompleto;
mutação sem `revalidatePath`/`router.refresh`; bugfix sem regressão;
async UI sem loading/empty/error; waterfall de I/O independente em RSC;
código pesado não necessário no 1º render sem `next/dynamic`.

**medium** — abstração cedo; wrapper fino; duplicar em vez de importar; lógica
pesada / nested component em `.tsx`; `watch()` no render; a11y fake; stopgap;
seed-once de URL.

**low** — naming genérico; comentário narrativo; nit de mídia/responsive sem
quebra; escopo extra sem impacto. Não bloqueia merge.

Hard cutover: preservar dois caminhos **não** é low — default high até o PR
documentar exceção de contrato externo.

## Famílias dos gates (verify / knip / oxlint)

Estas famílias têm dono: o gate mecânico. O reviewer decide pelo estado do CI,
não pela natureza do defeito —

- **CI vermelho apontando o defeito** → silêncio; comentar duplica o CI.
- **CI verde com o defeito no diff** → o gate está furado. Publique a violação
  e, no mesmo comentário, recomende consertar a regra/grep em `tooling/`
  (ADR-021: o gate é a continuidade entre sessões; furo não se conserta
  sozinho).

As famílias:

- cache proibido (`'use cache'`, `force-cache`, `revalidate>0`, `force-static`)
- fetch/watch de dados em Client / `useEffect`
- `valibot` fora de `*.schema.ts`; `ky` fora de `lib/api`; HTTP cru ao backend
- barrels; direção de camadas óbvia já falhando no gate
- `document.cookie`; lib JWT; `middleware.ts`
- `assert`, non-null `!`, `as T`, `any`
- memo manual (`useMemo`/`useCallback`/`React.memo`) — `boilerplate/no-manual-memo`
- try/catch de parse que engole erro com default — `boilerplate/no-defensive-parse`
  (só esse recorte; fallback pós-schema fora de catch é must-flag)
- literal de id com o registry em escopo no arquivo —
  `boilerplate/no-catalog-literal-compare` (fora de escopo é must-flag)
- estado derivado em `useEffect` — `boilerplate/no-derived-state-in-effect`
- `watch()` em effect — `boilerplate/no-watch-in-effect`; mapper passthrough —
  `boilerplate/no-passthrough-mapper`
- default não-primitiva literal/`new` em prop —
  `react/no-object-type-as-default-prop` (default por chamada de função é
  lente 7)
- `useEffectEvent` em deps de effect — `react/exhaustive-deps`
- dead code / deps (Knip); return type explícito; `no-await-in-loop`
- runtime Node / TypeScript clássico

**Itens de processo** — estilo de commit, base branch, selo de pre-review,
tamanho 3000 LOC — não são famílias de gate nem defeito do diff: silêncio
incondicional, qualquer que seja o estado do CI (mesma régua da pre-review:
"regras de commit, PR e base são processo").

Post-review adversarial ataca julgamento: simplicidade, contrato, hard cutover,
SRP, observabilidade — sem teto artificial de comentários no que sobreviver à
lente 9.

## Relação com pre-review

Se existir `.agents/tmp/pre-review-<HEAD>.ok` para o mesmo SHA, não reabra o
placar A–G inteiro — foque integração, callers fora do diff, commits pós-selo
e o que um revisor humano bloquearia no GitHub. Sem selo ou com HEAD diferente,
aplique o catálogo completo (ainda sem duplicar gates automáticos).
