import { array, object, picklist, string, type InferOutput } from "valibot";

const organizationSchema = object({
  id: string(),
  slug: string(),
  name: string(),
  status: picklist(["active", "suspended"]),
  created_at: string(),
  role: picklist(["owner", "admin", "member", "viewer"]),
  membership_status: picklist(["active", "invited", "disabled"]),
});

/** GET /api/v1/organizacoes → data. Source: OpenAPI OrganizationMembership. */
export const organizationsResponseSchema = object({ organizacoes: array(organizationSchema) });
export type Organization = InferOutput<typeof organizationSchema>;
export type OrganizationsResponse = InferOutput<typeof organizationsResponseSchema>;

/** POST /api/v1/organizacoes → data. Source: OpenAPI Organization. */
export const organizationCreateResponseSchema = object({
  organizacao: object({
    id: string(),
    slug: string(),
    name: string(),
    status: picklist(["active", "suspended"]),
    created_at: string(),
  }),
});

export const inviteResponseActions = ["aceitar", "recusar"] as const;
export type InviteResponseAction = (typeof inviteResponseActions)[number];
