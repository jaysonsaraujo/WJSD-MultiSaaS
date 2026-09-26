import { check, type InferOutput, minLength, object, pipe, string } from "valibot";

export const senhaFormSchema = pipe(
  object({
    senhaAtual: pipe(string(), minLength(1, "Informe a senha atual.")),
    novaSenha: pipe(string(), minLength(1, "Informe a nova senha.")),
    repetirSenha: pipe(string(), minLength(1, "Repita a nova senha.")),
  }),
  check((dados) => dados.novaSenha === dados.repetirSenha, "As novas senhas não coincidem."),
);

export type SenhaFormInput = InferOutput<typeof senhaFormSchema>;
