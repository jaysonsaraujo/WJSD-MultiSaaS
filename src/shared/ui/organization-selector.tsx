"use client";

import { useState } from "react";

import type { Organization } from "@/shared/schemas/organizations.schema";

const STORAGE_KEY = "wjsd-organization-id";

export function OrganizationSelector({
  organizations,
}: {
  organizations: Organization[];
}): React.ReactNode {
  const [selectedId, setSelectedId] = useState(organizations[0]?.id ?? "");

  if (organizations.length === 0) return null;

  function selecionar(id: string): void {
    setSelectedId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
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
