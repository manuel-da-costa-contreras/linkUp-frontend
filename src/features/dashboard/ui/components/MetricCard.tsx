import { Card } from "@components/ui";
import { cn } from "@utils/cn";

type MetricCardProps = {
  label: string;
  value: string;
  delta: number;
  periodLabel: string;
  tone?: "default" | "warning";
};

export function MetricCard({
  label,
  value,
  delta,
  periodLabel,
  tone = "default",
}: MetricCardProps) {
  const positive = delta >= 0;

  return (
    <Card className="space-y-1">
      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
      <p
        className={cn(
          "text-sm",
          tone === "warning"
            ? "text-amber-600"
            : positive
              ? "text-emerald-600"
              : "text-rose-600"
        )}
      >
        {positive ? "+" : ""}
        {delta}% {periodLabel}
      </p>
    </Card>
  );
}

