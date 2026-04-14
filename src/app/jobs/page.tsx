"use client";

import { DashboardShell } from "@/components/ui";
import { JobsTable } from "@/features/jobs";
import { useAuth } from "@/lib/auth";

export default function JobsPage() {
  const { user } = useAuth();
  const activeOrgId = user?.orgId ?? (process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ?? "acme");

  return (
    <DashboardShell>
      <JobsTable orgId={activeOrgId} />
    </DashboardShell>
  );
}
