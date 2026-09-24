import { apiClient } from "@/lib/api/client";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import {
  organizationsResponseSchema,
  type OrganizationsResponse,
} from "@/shared/schemas/organizations.schema";
import { OrganizationSelector } from "@/features/layout/organization-selector";
import { AppShellClient } from "@/features/layout/app-shell-client";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";

type AppShellProps = { children: React.ReactNode };

export async function AppShell({ children }: AppShellProps): Promise<React.ReactNode> {
  return (
    <Suspense fallback={<AppShellClient>{children}</AppShellClient>}>
      <AppShellWithOrganization>{children}</AppShellWithOrganization>
    </Suspense>
  );
}

async function AppShellWithOrganization({ children }: AppShellProps): Promise<React.ReactNode> {
  let organizations: OrganizationsResponse | undefined;
  try {
    organizations = await apiClient(
      kyServer,
      API_ENDPOINTS.organizations.list,
      organizationsResponseSchema,
    );
  } catch {
    organizations = undefined;
  }

  return (
    <AppShellClient
      organizationSlot={
        organizations ? (
          <OrganizationSelector
            organizations={organizations.organizacoes}
            selectedId={(await cookies()).get(ORGANIZATION_COOKIE)?.value}
          />
        ) : undefined
      }
    >
      {children}
    </AppShellClient>
  );
}
