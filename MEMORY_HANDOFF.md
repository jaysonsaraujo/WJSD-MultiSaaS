# Memória de continuidade — WJSD MultiSaaS

Atualizado em 21/09/2026.

## Produto e ambientes

- Produto: **WJSD Sistemas e Tecnologia — MultiSaaS**.
- Slogan: **Sistemas que ajudam pessoas a ajudar pessoas.**
- Frontend: `https://wjsd.com.br`.
- Backend: `https://api.wjsd.com.br`.
- Repositórios:
  - Frontend: `jaysonsaraujo/WJSD-MultiSaaS`.
  - Backend: `jaysonsaraujo/WJSD-MultiSaaS-Backend`.
- VPS/Swarm: `169.58.4.15`, nó `OrionWJSD`, rede externa `OrionNET`.
- O serviço legado `multisaas_frontend` / Botmagic foi preservado e não deve ser reutilizado.

## O que foi entregue

### Backend

- API REST publicada com:
  - `GET /health`
  - `POST /api/v1/login`
  - `POST /api/v1/logout`
  - `GET /api/v1/perfil`
  - `PUT /api/v1/perfil`
  - `PUT /api/v1/senha`
- Contrato OpenAPI em `openapi/openapi.yaml`.
- PostgreSQL próprio no Swarm, migração inicial aplicada.
- Cookie de sessão `HttpOnly`, `Secure`, `SameSite=Lax`, domínio `.wjsd.com.br`.
- Logout idempotente expira `session_token` com `Max-Age=0`.
- Imagem atualmente publicada: `169.58.4.15:5000/wjsd-multisaas-backend:ebe1744`.
- Serviços esperados: `wjsd_api 1/1` e `wjsd_db 1/1`.

### Frontend

- Frontend Next.js 16 com saída standalone em Docker/Bun.
- Design premium dark mode: fundo quase preto, roxo/violeta, cards escuros, gradientes discretos, bordas arredondadas, foco acessível e `prefers-reduced-motion`.
- Identidade visual aplicada na entrada:
  - WJSD Sistemas e Tecnologia.
  - slogan institucional.
  - tela `/login` responsiva.
  - raiz `/` redireciona para `/login` sem sessão e `/perfil` com sessão.
- Perfil com edição de dados, troca de senha e botão **Sair**.
- Logout browser-direct chama `POST /api/v1/logout`, remove a sessão no backend e redireciona para `/login`.
- Imagem atualmente publicada: `169.58.4.15:5000/wjsd-multisaas-web:bdb1efd`.
- Serviço esperado: `wjsd_web 1/1`.

## Evidências de validação

- `https://wjsd.com.br` responde `200` e termina em `/login` quando não há sessão.
- `https://api.wjsd.com.br/health` responde `200`.
- Login, perfil e troca de senha foram validados com o backend real.
- `POST /api/v1/logout` respondeu `200` e devolveu `Set-Cookie` expirando `session_token`.
- Builds Docker de frontend e backend concluídos.
- `bun run verify` chegou a 126 testes passando em execuções estáveis.
- Alguns pre-push completos tiveram timeouts intermitentes nos testes de hooks do próprio tooling; os mesmos testes passaram isoladamente.

## Git e publicação

- Frontend está na branch `feat/wjsd-visual-identity`, com deploy ativo e commits recentes:
  - `1c09ca8` — imagem/stack do logout.
  - `bdb1efd` — botão de logout e endpoint frontend.
  - `ae34871` — identidade visual e entrada na raiz.
- Backend está na branch `chore/deploy-logout-image`, com:
  - `ebe1744` — endpoint de logout mesclado na `main`.
  - `949774e` — pin da imagem publicada no stack.
- Registry interno é HTTP; Docker Desktop não faz push HTTPS para ele. O procedimento comprovado é `docker save` → `scp` → `docker load` → `docker stack deploy --resolve-image never`.
- GitHub Actions permanece indisponível por limitação de plano/pagamento; os gates locais e smoke tests são a evidência operacional.

## Próximos passos

1. Abrir/mesclar a PR do frontend `feat/wjsd-visual-identity` na `main`, após o selo de pré-review deste HEAD.
2. Abrir/mesclar a PR `chore/deploy-logout-image` do backend, caso o commit de pin do stack ainda não esteja integrado na `main`.
3. Revalidar no navegador: entrar, acessar `/perfil`, clicar **Sair** e confirmar retorno a `/login`.
4. Fazer uma revisão visual em larguras mobile, intermediária e desktop.
5. Opcional: configurar `www.wjsd.com.br` como redirecionamento para `wjsd.com.br`; não adicionar sem requisito explícito.
6. Opcional: adicionar monitoramento/alerta para `wjsd_api`, `wjsd_web` e backups automatizados do PostgreSQL.

## Regras de continuidade

- Não expor nem registrar senhas, JWTs, secrets Swarm ou valores de `.env`.
- Não substituir o serviço Botmagic existente.
- Não inventar endpoints: conferir primeiro `openapi/openapi.yaml` e o backend live.
- Separar sempre estado do código, build, imagem, serviço Swarm e comportamento servido.
- Para qualquer mudança de produção, validar o caminho real no navegador ou por probe HTTP após convergência.
