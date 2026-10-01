import { array, nullable, number, object, picklist, string, type InferOutput } from "valibot";

const paymentSchema = object({
  id: string(),
  organization_id: string(),
  client_id: nullable(string()),
  amount_cents: number(),
  method: picklist(["pix", "card", "boleto", "other"]),
  status: picklist(["pending", "paid", "failed", "refunded"]),
  reference: nullable(string()),
  paid_at: nullable(string()),
  created_by: string(),
  created_at: string(),
  updated_at: string(),
});
export const paymentsResponseSchema = object({ pagamentos: array(paymentSchema) });
export const paymentResponseSchema = object({ pagamento: paymentSchema });
export type PaymentsResponse = InferOutput<typeof paymentsResponseSchema>;
