"use client";

import { Card, Loader, SectionHeading } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";
import { useDashboardSnapshot } from "../hooks/useDashboardSnapshot";
import { JobsTrendChart } from "./JobsTrendChart";
import { MetricCard } from "./MetricCard";
import { SatisfactionCard } from "./SatisfactionCard";

type DashboardOverviewProps = {
  orgId: string;
};

export function DashboardOverview({ orgId }: DashboardOverviewProps) {
  const { snapshot, loading, error } = useDashboardSnapshot(orgId);
  const { t } = useI18n();

  function formatLastUpdate(date: Date | null) {
    if (!date) {
      return t("dashboard.lastUpdate.empty");
    }

    return t("dashboard.lastUpdate.label", { value: date.toLocaleString("es-ES") });
  }

  if (loading) {
    return (
      <Card>
        <Loader centered label={t("dashboard.loading")} />
      </Card>
    );
  }

  if (error || !snapshot) {
    return <Card className="text-red-700">{error ?? t("dashboard.errors.noData")}</Card>;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title={t("dashboard.heading.title")}
        description={t("dashboard.heading.description")}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t("dashboard.metrics.activeUsers")}
          value={String(snapshot.metrics.activeUsers.value)}
          delta={snapshot.metrics.activeUsers.delta}
          periodLabel={snapshot.metrics.activeUsers.periodLabel}
        />
        <MetricCard
          label={t("dashboard.metrics.openAlerts")}
          value={String(snapshot.metrics.openAlerts.value)}
          delta={snapshot.metrics.openAlerts.delta}
          periodLabel={snapshot.metrics.openAlerts.periodLabel}
          tone="warning"
        />
        <MetricCard
          label={t("dashboard.metrics.completedTasks")}
          value={String(snapshot.metrics.completedTasks.value)}
          delta={snapshot.metrics.completedTasks.delta}
          periodLabel={snapshot.metrics.completedTasks.periodLabel}
        />
        <MetricCard
          label={t("dashboard.metrics.satisfaction")}
          value={`${snapshot.metrics.satisfaction.value}%`}
          delta={snapshot.metrics.satisfaction.delta}
          periodLabel={snapshot.metrics.satisfaction.periodLabel}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <JobsTrendChart points={snapshot.jobsTrend} />
        </div>
        <SatisfactionCard data={snapshot.satisfactionBreakdown} />
      </div>

      <p className="text-xs text-zinc-500">{formatLastUpdate(snapshot.updatedAt)}</p>
    </div>
  );
}