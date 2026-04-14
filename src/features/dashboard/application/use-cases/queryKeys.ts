export const dashboardQueryKeys = {
  snapshot: (orgId: string) => ["dashboard", orgId, "snapshot"] as const,
};