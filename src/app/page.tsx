"use client";

import { DashboardShell } from "@/components/ui";
import { DashboardOverview } from "@/features/dashboard";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();
  const activeOrgId = user?.orgId ?? (process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ?? "demo-org");

  return (
    <DashboardShell>
      <DashboardOverview orgId={activeOrgId} />
    </DashboardShell>
  );
}
