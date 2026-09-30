import { array, object, picklist, string, type InferOutput } from "valibot";

const memberSchema = object({
  user_id: string(),
  name: string(),
  email: string(),
  role: picklist(["owner", "admin", "member", "viewer"]),
  status: picklist(["active", "invited", "disabled"]),
  created_at: string(),
});

export const membersResponseSchema = object({ membros: array(memberSchema) });
export type OrganizationMember = InferOutput<typeof memberSchema>;
export type MembersResponse = InferOutput<typeof membersResponseSchema>;

export const inviteRoles = ["admin", "member", "viewer"] as const;
export type InviteRole = (typeof inviteRoles)[number];
