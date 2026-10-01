import { array, nullable, number, object, picklist, string, type InferOutput } from "valibot";

const planSchema = object({
  id: string(),
  organization_id: string(),
  name: string(),
  slug: string(),
  description: nullable(string()),
  price_cents: number(),
  billing_interval: picklist(["month", "year"]),
  status: picklist(["active", "inactive"]),
  created_by: string(),
  created_at: string(),
  updated_at: string(),
});

export const plansResponseSchema = object({ planos: array(planSchema) });
export const planResponseSchema = object({ plano: planSchema });
export type PlansResponse = InferOutput<typeof plansResponseSchema>;
