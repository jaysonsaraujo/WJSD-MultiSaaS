"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";

const ERRO_INESPERADO = "Não foi possível sair. Tente novamente.";

/** Encerra a sessão no backend e retorna o visitante à entrada do produto. */
export function LogoutButton(): React.ReactNode {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [saindo, setSaindo] = useState(false);

  async function sair(): Promise<void> {
    setErro(null);
    setSaindo(true);
    try {
      await apiClient(kyClient, API_ENDPOINTS.auth.logout, undefined, { method: "post" });
      router.replace("/login");
      router.refresh();
    } catch (error: unknown) {
      setSaindo(false);
      setErro(error instanceof Error ? error.message : ERRO_INESPERADO);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={sair}
        disabled={saindo}
        className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium transition hover:border-violet-400 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saindo ? "Saindo..." : "Sair"}
      </button>
      {erro ? (
        <p role="alert" className="max-w-48 text-right text-xs text-red-400">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
