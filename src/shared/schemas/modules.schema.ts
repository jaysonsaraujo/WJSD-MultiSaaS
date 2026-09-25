import { array, nullable, number, object, picklist, string, type InferOutput } from "valibot";

const moduleSchema = object({
  id: string(),
  organization_id: string(),
  name: string(),
  slug: string(),
  description: nullable(string()),
  status: picklist(["active", "inactive"]),
  sort_order: number(),
  created_by: string(),
  created_at: string(),
  updated_at: string(),
});

export const modulesResponseSchema = object({ modulos: array(moduleSchema) });
export const moduleResponseSchema = object({ modulo: moduleSchema });
export type ModulesResponse = InferOutput<typeof modulesResponseSchema>;
