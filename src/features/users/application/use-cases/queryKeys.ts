export const usersQueryKeys = {
  list: (orgId: string) => ["users", orgId, "list"] as const,
};