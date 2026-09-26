import { array, nullable, object, picklist, string, type InferOutput } from "valibot";

const productSchema = object({
  id: string(),
  organization_id: string(),
  name: string(),
  slug: string(),
  description: nullable(string()),
  status: picklist(["active", "inactive"]),
  created_by: string(),
  created_at: string(),
  updated_at: string(),
});

export const productsResponseSchema = object({
  produtos: array(productSchema),
});

export const productResponseSchema = object({
  produto: productSchema,
});

export type ProductsResponse = InferOutput<typeof productsResponseSchema>;
