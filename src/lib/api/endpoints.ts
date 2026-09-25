/**
 * Config central dos endpoints do backend: fonte única de todos os paths REST do
 * projeto, agrupados por domínio.
 *
 * Cada valor é o path relativo ao `baseUrl` da instância ky (sem barra inicial).
 * A base URL não entra aqui: ela vive no `kyServer`/`kyClient` (ver `ky.server`,
 * `ky.client` e `base-url`), então este arquivo guarda só os caminhos.
 * Centralizar evita string de endpoint solta espalhada pelas features e dá um
 * lugar só para revisar os paths contra o contrato (skill `api-contract`).
 *
 * Cada novo endpoint entra aqui no domínio correspondente, não como const local.
 */
export const API_ENDPOINTS = {
  /** Sessão do usuário. Chamado browser-direct: o backend emite o cookie. */
  auth: {
    login: "api/v1/login",
    logout: "api/v1/logout",
    senha: "api/v1/senha",
  },

  /** Perfil do usuário autenticado — a feature de exemplo do boilerplate. */
  perfil: {
    me: "api/v1/perfil",
  },

  organizations: {
    list: "api/v1/organizacoes",
    products: (organizationId: string) => `api/v1/organizacoes/${organizationId}/produtos`,
    plans: (organizationId: string) => `api/v1/organizacoes/${organizationId}/planos`,
    clients: (organizationId: string) => `api/v1/organizacoes/${organizationId}/clientes`,
    payments: (organizationId: string) => `api/v1/organizacoes/${organizationId}/pagamentos`,
    modules: (organizationId: string) => `api/v1/organizacoes/${organizationId}/modulos`,
    moduleAssociations: (organizationId: string, moduleId: string) =>
      `api/v1/organizacoes/${organizationId}/modulos/${moduleId}/associacoes`,
  },
} as const;
