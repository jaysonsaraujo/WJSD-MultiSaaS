import {
  email,
  type InferOutput,
  minLength,
  nullable,
  object,
  pipe,
  safeParse,
  string,
} from "valibot";

/**
 * Contrato do perfil, espelhado 1:1 do spec do backend (skill `api-contract`).
 *
 * Regra da borda: o schema descreve a FORMA do contrato, não regra de negócio.
 * `minLength(1)` está aqui porque o backend rejeita nome vazio — não é um
 * limiar inventado no front. Qualquer regra que o backend não imponha (limite
 * de caracteres "porque a UI fica feia", faixa de valores, elegibilidade) NÃO
 * entra: authz e regra de negócio são do backend.
 */
export const perfilSchema = object({
  id: string(),
  nome: pipe(string(), minLength(1, "Informe o nome.")),
  email: pipe(string(), email("E-mail inválido.")),
  /** `nullable` porque o spec marca o campo como opcional no cadastro. */
  telefone: nullable(string()),
});

/** Perfil como o backend devolve. Fonte única do tipo — não redeclare à mão. */
export type Perfil = InferOutput<typeof perfilSchema>;

/**
 * Campos editáveis do perfil. Subconjunto do contrato acima: o mesmo schema
 * valida no client (UX, via `valibotResolver`) e é revalidado no server antes
 * de chamar o backend. Validação no client é UX — nunca a fronteira de segurança.
 */
export const perfilFormSchema = object({
  nome: pipe(string(), minLength(1, "Informe o nome.")),
  email: pipe(string(), email("E-mail inválido.")),
  telefone: nullable(string()),
});

/** Payload do formulário de perfil. */
export type PerfilFormInput = InferOutput<typeof perfilFormSchema>;

/**
 * Revalida no servidor o payload que já passou pelo `valibotResolver` no client.
 *
 * Mora aqui, e não na Server Action, porque `valibot` é confinado aos
 * `*.schema.ts`: a borda de validação é este arquivo, e quem chama recebe o
 * valor já tipado.
 *
 * @param entrada - Payload cru vindo do formulário.
 * @returns Os campos validados.
 * @throws `Error` com a primeira mensagem de validação.
 */
export function parsePerfilForm(entrada: unknown): PerfilFormInput {
  const resultado = safeParse(perfilFormSchema, entrada);
  if (!resultado.success) {
    // `issues` do valibot é tupla não-vazia: o primeiro item sempre existe.
    throw new Error(resultado.issues[0].message);
  }
  return resultado.output;
}
