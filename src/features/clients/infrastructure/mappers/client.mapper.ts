import type { Client } from "../../domain/entities/Client";

type ClientApiItem = {
  id?: string;
  name?: string;
  totalJobs?: number;
  pendingJobs?: number;
  inProgressJobs?: number;
  completedJobs?: number;
};

export function mapClientApiToDomain(source: Record<string, unknown>): Client {
  const item = source as ClientApiItem;

  return {
    id: typeof item.id === "string" ? item.id : "",
    name: typeof item.name === "string" ? item.name : "Sin nombre",
    totalJobs: Number.isFinite(item.totalJobs) ? Number(item.totalJobs) : 0,
    pendingJobs: Number.isFinite(item.pendingJobs) ? Number(item.pendingJobs) : 0,
    inProgressJobs: Number.isFinite(item.inProgressJobs) ? Number(item.inProgressJobs) : 0,
    completedJobs: Number.isFinite(item.completedJobs) ? Number(item.completedJobs) : 0,
  };
}