export interface MetricItem {
  value: number;
  delta: number;
  periodLabel: string;
}

export interface DashboardMetrics {
  activeUsers: MetricItem;
  openAlerts: MetricItem;
  completedTasks: MetricItem;
  satisfaction: MetricItem;
}

export interface JobsTrendPoint {
  label: string;
  open: number;
  completed: number;
}

export interface SatisfactionBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface DashboardSnapshot {
  orgId: string;
  metrics: DashboardMetrics;
  jobsTrend: JobsTrendPoint[];
  satisfactionBreakdown: SatisfactionBreakdown;
  updatedAt: Date | null;
}