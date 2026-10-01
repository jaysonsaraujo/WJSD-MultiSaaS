import { array, nullable, number, object, picklist, string, type InferOutput } from "valibot";

/** GET /api/v1/notificacoes — `data` em openapi/openapi.yaml (Notification). */

const notificationSchema = object({
  id: string(),
  organization_id: string(),
  kind: picklist([
    "purchase_refused",
    "subscription_renewal_refused",
    "subscription_late",
    "refund",
    "chargeback",
    "subscription_late_recovered",
    "payment_failed",
    "payment_refunded",
  ]),
  title: string(),
  body: string(),
  payment_reference: nullable(string()),
  next_payment_at: nullable(string()),
  read_at: nullable(string()),
  created_at: string(),
});

export const notificationsResponseSchema = object({
  notificacoes: array(notificationSchema),
  nao_lidas: number(),
});

export type Notification = InferOutput<typeof notificationSchema>;
