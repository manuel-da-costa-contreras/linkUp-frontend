export const notificationsQueryKeys = {
  all: (orgId: string) => ["notifications", orgId] as const,
  jobAlerts: (orgId: string) => ["notifications", orgId, "job-alerts"] as const,
};
