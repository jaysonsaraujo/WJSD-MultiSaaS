import { array, nullable, number, object, string, type InferOutput } from "valibot";

const moduleLimitSchema = object({
  id: string(),
  organization_id: string(),
  module_id: string(),
  plan_id: nullable(string()),
  metric_key: string(),
  limit_value: number(),
  unit: string(),
  created_at: string(),
  updated_at: string(),
});

export const moduleLimitsResponseSchema = object({ limites: array(moduleLimitSchema) });
export const moduleLimitsSaveResponseSchema = object({ limites: array(moduleLimitSchema) });
export type ModuleLimit = InferOutput<typeof moduleLimitSchema>;
export type ModuleLimitsResponse = InferOutput<typeof moduleLimitsResponseSchema>;
