"use client";

import { useState } from "react";

import type { Organization } from "@/shared/schemas/organizations.schema";
import { ORGANIZATION_COOKIE } from "@/shared/utils/organization";
import { persistOrganizationSelection } from "@/features/layout/organization.actions";

export function OrganizationSelector({
  organizations,
  selectedId: initialSelectedId,
}: {
  organizations: Organization[];
  selectedId?: string;
}): React.ReactNode {
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? organizations[0].id);

  if (organizations.length === 0) return null;

  function selecionar(id: string): void {
    setSelectedId(id);
    window.localStorage.setItem(ORGANIZATION_COOKIE, id);
    void persistOrganizationSelection(id);
    window.dispatchEvent(new CustomEvent("wjsd-organization-change", { detail: id }));
  }

  return (
    <label className="app-organization-selector">
      <span>Organização</span>
      <select
        aria-label="Selecionar organização"
        value={selectedId}
        onChange={(event) => selecionar(event.target.value)}
      >
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
    </label>
  );
}
