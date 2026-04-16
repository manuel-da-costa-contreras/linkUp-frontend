"use client";

import { useEffect, useRef, useState } from "react";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Loader } from "@components/ui";
import { useI18n } from "@i18n/I18nProvider";
import type { JobsTrendPoint } from "@features/dashboard/domain/entities/DashboardSnapshot";

type JobsTrendChartProps = {
  points: JobsTrendPoint[];
};

const chartColors = {
  axis: "var(--chart-axis)",
  tooltipBorder: "var(--chart-tooltip-border)",
  openSeries: "var(--chart-series-open)",
  completedSeries: "var(--chart-series-completed)",
} as const;

export function JobsTrendChart({ points }: JobsTrendChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const { t } = useI18n();

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.floor(entries[0]?.contentRect.width ?? 0);
      if (nextWidth > 0) {
        setChartWidth(nextWidth);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Card className="min-h-72">
      <p className="text-sm font-semibold text-neutral-800">{t("dashboard.chart.title")}</p>
      <p className="mt-1 text-sm text-neutral-600">{t("dashboard.chart.description")}</p>
      <div ref={containerRef} className="mt-4 h-56 min-h-56 w-full min-w-0">
        {chartWidth > 0 ? (
          <LineChart width={Math.max(chartWidth, 200)} height={224} data={points}>
            <XAxis dataKey="label" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                borderColor: chartColors.tooltipBorder,
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="open"
              stroke={chartColors.openSeries}
              strokeWidth={2}
              dot={false}
              name={t("dashboard.chart.openSeries")}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke={chartColors.completedSeries}
              strokeWidth={2}
              dot={false}
              name={t("dashboard.chart.completedSeries")}
            />
          </LineChart>
        ) : (
          <Loader centered label="" />
        )}
      </div>
    </Card>
  );
}



