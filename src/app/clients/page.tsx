"use client";

import { DashboardShell } from "@/components/ui";
import { ClientsTable } from "@/features/clients";
import { useAuth } from "@/lib/auth";

export default function ClientsPage() {
  const { user } = useAuth();
  const activeOrgId = user?.orgId ?? (process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ?? "acme");

  return (
    <DashboardShell>
      <ClientsTable orgId={activeOrgId} />
    </DashboardShell>
  );
}
