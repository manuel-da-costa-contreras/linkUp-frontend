import type {
  DashboardMetrics,
  DashboardSnapshot,
  JobsTrendPoint,
  SatisfactionBreakdown,
} from "../../domain/entities/DashboardSnapshot";

type ApiTimestampObject = {
  _seconds?: number;
  _nanoseconds?: number;
};

type ApiMetricItem = {
  value?: number;
  delta?: number;
  periodLabel?: string;
};

type DashboardApiResponse = {
  metrics?: {
    activeUsers?: ApiMetricItem;
    openAlerts?: ApiMetricItem;
    completedTasks?: ApiMetricItem;
    satisfaction?: ApiMetricItem;
  };
  jobsTrend?: Array<{
    label?: string;
    open?: number;
    completed?: number;
  }>;
  satisfactionBreakdown?: {
    positive?: number;
    neutral?: number;
    negative?: number;
  };
  updatedAt?: ApiTimestampObject | string | null;
};

function resolveMetricItem(source: ApiMetricItem | undefined) {
  return {
    value: source?.value ?? 0,
    delta: source?.delta ?? 0,
    periodLabel: source?.periodLabel ?? "Sin periodo",
  };
}

function resolveMetrics(source: DashboardApiResponse["metrics"]): DashboardMetrics {
  return {
    activeUsers: resolveMetricItem(source?.activeUsers),
    openAlerts: resolveMetricItem(source?.openAlerts),
    completedTasks: resolveMetricItem(source?.completedTasks),
    satisfaction: resolveMetricItem(source?.satisfaction),
  };
}

function resolveTrend(source: DashboardApiResponse["jobsTrend"]): JobsTrendPoint[] {
  if (!source || source.length === 0) {
    return [];
  }

  return source.map((item) => ({
    label: item.label ?? "N/A",
    open: item.open ?? 0,
    completed: item.completed ?? 0,
  }));
}

function resolveSatisfaction(
  source: DashboardApiResponse["satisfactionBreakdown"]
): SatisfactionBreakdown {
  return {
    positive: source?.positive ?? 0,
    neutral: source?.neutral ?? 0,
    negative: source?.negative ?? 0,
  };
}

function resolveDate(value: DashboardApiResponse["updatedAt"]) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const seconds = value._seconds;
  const nanoseconds = value._nanoseconds ?? 0;

  if (typeof seconds !== "number") {
    return null;
  }

  return new Date(seconds * 1000 + Math.floor(nanoseconds / 1000000));
}

export function mapDashboardResponseToDomain(
  orgId: string,
  data: Record<string, unknown> | null
): DashboardSnapshot {
  const source = (data ?? {}) as DashboardApiResponse;

  return {
    orgId,
    metrics: resolveMetrics(source.metrics),
    jobsTrend: resolveTrend(source.jobsTrend),
    satisfactionBreakdown: resolveSatisfaction(source.satisfactionBreakdown),
    updatedAt: resolveDate(source.updatedAt),
  };
}