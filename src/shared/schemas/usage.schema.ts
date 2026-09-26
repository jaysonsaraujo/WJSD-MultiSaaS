import { array, nullable, number, object, string, type InferOutput } from "valibot";

const usageSummarySchema = object({
  metric_key: string(),
  period_start: string(),
  period_end: string(),
  total_quantity: number(),
  unit: nullable(string()),
});

const usageEventSchema = object({
  id: string(),
  organization_id: string(),
  module_id: string(),
  plan_id: nullable(string()),
  metric_key: string(),
  quantity: number(),
  period_start: string(),
  period_end: string(),
  source: nullable(string()),
  created_by: string(),
  created_at: string(),
});

export const usageResponseSchema = object({ uso: array(usageSummarySchema) });
export const usageEventResponseSchema = object({ evento: usageEventSchema });
export type UsageSummary = InferOutput<typeof usageSummarySchema>;
export type UsageEvent = InferOutput<typeof usageEventSchema>;
