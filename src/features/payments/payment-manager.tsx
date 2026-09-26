"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyClient } from "@/lib/api/ky.client";
import { paymentResponseSchema, type PaymentsResponse } from "@/shared/schemas/payments.schema";

type Payment = PaymentsResponse["pagamentos"][number];
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const methods = ["pix", "card", "boleto", "other"] as const;
const statuses = ["pending", "paid", "failed", "refunded"] as const;
type PaymentMethod = (typeof methods)[number];
type PaymentStatus = (typeof statuses)[number];
const methodSet = new Set<string>(methods);
const statusSet = new Set<string>(statuses);
function isMethod(value: string): value is PaymentMethod {
  return methodSet.has(value);
}
function isStatus(value: string): value is PaymentStatus {
  return statusSet.has(value);
}
const methodLabel: Record<(typeof methods)[number], string> = {
  pix: "PIX",
  card: "Cartão",
  boleto: "Boleto",
  other: "Outro",
};
const statusLabel: Record<(typeof statuses)[number], string> = {
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
  refunded: "Estornado",
};

export function PaymentManager({
  organizationId,
  initialPayments,
}: {
  organizationId: string;
  initialPayments: Payment[];
}): React.ReactNode {
  const [payments, setPayments] = useState(initialPayments);
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const parsedAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage("Informe um valor válido.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await apiClient(
        kyClient,
        API_ENDPOINTS.organizations.payments(organizationId),
        paymentResponseSchema,
        {
          method: "post",
          json: {
            cliente_id: clientId || null,
            valor_centavos: Math.round(parsedAmount * 100),
            metodo: method,
            status,
            referencia: reference || null,
          },
        },
      );
      setPayments((current) => [response.pagamento, ...current]);
      setClientId("");
      setAmount("");
      setReference("");
      setMessage("Pagamento registrado com sucesso.");
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível registrar o pagamento.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <form className="app-development-card flex flex-col gap-4" onSubmit={submit}>
        <span className="app-development-status">Novo pagamento</span>
        <h2 className="text-xl font-semibold">Registrar pagamento</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Cliente (opcional)
            <input
              className="login-input w-full px-4 text-sm outline-none"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              placeholder="ID do cliente"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Valor
            <input
              className="login-input w-full px-4 text-sm outline-none"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="R$ 0,00"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Método
            <select
              className="login-input w-full px-4 text-sm outline-none"
              value={method}
              onChange={(event) => {
                if (isMethod(event.target.value)) setMethod(event.target.value);
              }}
            >
              {methods.map((item) => (
                <option key={item} value={item}>
                  {methodLabel[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Status
            <select
              className="login-input w-full px-4 text-sm outline-none"
              value={status}
              onChange={(event) => {
                if (isStatus(event.target.value)) setStatus(event.target.value);
              }}
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {statusLabel[item]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          Referência
          <input
            className="login-input w-full px-4 text-sm outline-none"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Código externo (opcional)"
          />
        </label>
        <button
          className="login-primary-button px-4 text-sm font-semibold disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Salvando..." : "Registrar pagamento"}
        </button>
        {message ? <output className="text-sm text-foreground/70">{message}</output> : null}
      </form>
      <section className="app-development-card">
        <span className="app-development-status">Dados reais</span>
        <h2 className="mt-3 text-xl font-semibold">Pagamentos registrados</h2>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">
            Nenhum pagamento registrado nesta organização.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {payments.map((payment) => (
              <li className="app-dashboard-module" key={payment.id}>
                <strong>{currency.format(payment.amount_cents / 100)}</strong>
                <small>
                  {methodLabel[payment.method]} · {statusLabel[payment.status]}
                </small>
                {payment.client_id ? <span>Cliente: {payment.client_id}</span> : null}
                {payment.reference ? <span>Ref.: {payment.reference}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
