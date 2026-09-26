import { array, nullable, object, picklist, string, type InferOutput } from "valibot";
const clientSchema = object({
  id: string(),
  organization_id: string(),
  name: string(),
  email: nullable(string()),
  phone: nullable(string()),
  status: picklist(["active", "inactive"]),
  created_by: string(),
  created_at: string(),
  updated_at: string(),
});
export const clientsResponseSchema = object({ clientes: array(clientSchema) });
export const clientResponseSchema = object({ cliente: clientSchema });
export type ClientsResponse = InferOutput<typeof clientsResponseSchema>;
