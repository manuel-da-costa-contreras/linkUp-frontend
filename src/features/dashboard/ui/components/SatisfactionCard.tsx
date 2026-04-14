"use client";

import { Card } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";
import type { SatisfactionBreakdown } from "../../domain/entities/DashboardSnapshot";

type SatisfactionCardProps = {
  data: SatisfactionBreakdown;
};

export function SatisfactionCard({ data }: SatisfactionCardProps) {
  const total = data.positive + data.neutral + data.negative;
  const { t } = useI18n();

  function toPercent(value: number) {
    if (total === 0) {
      return 0;
    }

    return Math.round((value / total) * 100);
  }

  return (
    <Card className="space-y-3">
      <p className="text-sm font-semibold text-zinc-800">{t("dashboard.satisfaction.title")}</p>
      <div className="space-y-2 text-sm">
        <Row
          label={t("dashboard.satisfaction.positive")}
          count={data.positive}
          percent={toPercent(data.positive)}
          color="bg-emerald-500"
        />
        <Row
          label={t("dashboard.satisfaction.neutral")}
          count={data.neutral}
          percent={toPercent(data.neutral)}
          color="bg-zinc-400"
        />
        <Row
          label={t("dashboard.satisfaction.negative")}
          count={data.negative}
          percent={toPercent(data.negative)}
          color="bg-rose-500"
        />
      </div>
    </Card>
  );
}

type RowProps = {
  label: string;
  count: number;
  percent: number;
  color: string;
};

function Row({ label, count, percent, color }: RowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-zinc-700">
        <p>{label}</p>
        <p>
          {count} ({percent}%)
        </p>
      </div>
      <div className="h-2 rounded-full bg-zinc-100">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}