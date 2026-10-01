import { apiClient } from "@/lib/api/client";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { kyServer } from "@/lib/api/ky.server";
import { notificationsResponseSchema } from "@/shared/schemas/notifications.schema";
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
  const [organizationsResult, inboxResult] = await Promise.allSettled([
    apiClient(kyServer, API_ENDPOINTS.organizations.list, organizationsResponseSchema),
    apiClient(kyServer, API_ENDPOINTS.notificacoes.list, notificationsResponseSchema),
  ]);
  const organizations: OrganizationsResponse | undefined =
    organizationsResult.status === "fulfilled" ? organizationsResult.value : undefined;
  const unreadCount = inboxResult.status === "fulfilled" ? inboxResult.value.nao_lidas : 0;

  const selectedOrganizationId = (await cookies()).get(ORGANIZATION_COOKIE)?.value;

  return (
    <AppShellClient
      unreadCount={unreadCount}
      organizationSlot={
        organizations ? (
          <OrganizationSelector
            key={selectedOrganizationId}
            organizations={organizations.organizacoes}
            selectedId={selectedOrganizationId}
          />
        ) : undefined
      }
    >
      {children}
    </AppShellClient>
  );
}
