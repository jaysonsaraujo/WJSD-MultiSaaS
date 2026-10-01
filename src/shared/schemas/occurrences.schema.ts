import { array, nullable, object, string, type InferOutput } from "valibot";

const occurrenceSchema = object({
  id: string(),
  organization_id: string(),
  client_id: nullable(string()),
  title: string(),
  description: nullable(string()),
  priority: string(),
  status: string(),
  due_at: nullable(string()),
  resolved_at: nullable(string()),
  created_by: string(),
  created_at: string(),
  updated_at: string(),
});
export const occurrencesResponseSchema = object({ ocorrencias: array(occurrenceSchema) });
export const occurrenceResponseSchema = object({ ocorrencia: occurrenceSchema });
export type Occurrence = InferOutput<typeof occurrenceSchema>;
