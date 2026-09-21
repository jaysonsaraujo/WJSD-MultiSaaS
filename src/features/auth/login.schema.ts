import { email, type InferOutput, minLength, object, pipe, string } from "valibot";

/**
 * Credenciais de login, espelhando o contrato do backend.
 *
 * Note o que NÃO está aqui: regra de força de senha, tamanho mínimo "de
 * segurança", bloqueio por tentativas. Isso é política do backend — o schema do
 * front descreve só a forma do payload. `minLength(1)` existe porque enviar
 * campo vazio é erro de formulário, não regra de negócio.
 */
export const loginSchema = object({
  email: pipe(string(), email("E-mail inválido.")),
  senha: pipe(string(), minLength(1, "Informe a senha.")),
});

/** Payload do formulário de login. */
export type LoginInput = InferOutput<typeof loginSchema>;
