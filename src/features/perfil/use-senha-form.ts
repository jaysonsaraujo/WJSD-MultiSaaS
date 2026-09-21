"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

import { alterarSenha } from "./senha.actions";
import { senhaFormSchema, type SenhaFormInput } from "./senha.schema";

type UseSenhaForm = {
  form: UseFormReturn<SenhaFormInput>;
  enviar: (evento: React.FormEvent<HTMLFormElement>) => void;
  erroServidor: string | null;
  salvo: boolean;
};

export function useSenhaForm(): UseSenhaForm {
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const form = useForm<SenhaFormInput>({ resolver: valibotResolver(senhaFormSchema) });

  const enviar = form.handleSubmit(async (valores) => {
    setErroServidor(null);
    setSalvo(false);
    const resultado = await alterarSenha(valores);
    if (resultado.ok) {
      form.reset();
      setSalvo(true);
      return;
    }
    setErroServidor(resultado.erro);
  });

  return { form, enviar, erroServidor, salvo };
}
