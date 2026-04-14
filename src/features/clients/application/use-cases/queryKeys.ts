export const clientsQueryKeys = {
  all: (orgId: string) => ["clients", orgId] as const,
  list: (orgId: string, search: string, page: number, pageSize: number, sortBy: string, sortDir: "asc" | "desc") =>
    ["clients", orgId, "list", { search, page, pageSize, sortBy, sortDir }] as const,
};
