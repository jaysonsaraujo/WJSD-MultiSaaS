import { type InferOutput, minLength, object, pipe, string } from "valibot";

export const senhaFormSchema = object({
  senhaAtual: pipe(string(), minLength(1, "Informe a senha atual.")),
  novaSenha: pipe(string(), minLength(1, "Informe a nova senha.")),
});

export type SenhaFormInput = InferOutput<typeof senhaFormSchema>;
