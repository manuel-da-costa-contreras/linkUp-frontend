export const jobsQueryKeys = {
  all: (orgId: string) => ["jobs", orgId] as const,
  list: (orgId: string, page: number, pageSize: number, sortBy: string, sortDir: "asc" | "desc") =>
    ["jobs", orgId, "list", { page, pageSize, sortBy, sortDir }] as const,
  clientOptions: (orgId: string) => ["jobs", orgId, "client-options"] as const,
};
