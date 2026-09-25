import { array, number, object, picklist, string, type InferOutput } from "valibot";

const associationProductSchema = object({
  id: string(),
  organization_id: string(),
  name: string(),
  slug: string(),
  status: picklist(["active", "inactive"]),
});

const associationPlanSchema = object({
  id: string(),
  organization_id: string(),
  name: string(),
  slug: string(),
  price_cents: number(),
  billing_interval: picklist(["month", "year"]),
  status: picklist(["active", "inactive"]),
});

const associationsSchema = object({
  produtos: array(associationProductSchema),
  planos: array(associationPlanSchema),
});

export const moduleAssociationsResponseSchema = associationsSchema;
export const moduleAssociationsSaveResponseSchema = object({ associacoes: associationsSchema });
export type ModuleAssociations = InferOutput<typeof associationsSchema>;
