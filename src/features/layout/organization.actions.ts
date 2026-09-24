"use server";

import { cookies } from "next/headers";

import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

export async function persistOrganizationSelection(id: string): Promise<void> {
  (await cookies()).set(ORGANIZATION_COOKIE, id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 31_536_000,
  });
}
