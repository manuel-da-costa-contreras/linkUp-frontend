import type { Job, JobStatus } from "../../domain/entities/Job";

type JobApiItem = {
  id?: string;
  name?: string;
  clientId?: string;
  clientName?: string;
  status?: string;
};

function resolveStatus(status: string | undefined): JobStatus {
  if (status === "PENDING" || status === "IN_PROGRESS" || status === "COMPLETED" || status === "REJECTED") {
    return status;
  }

  return "PENDING";
}

export function mapJobApiToDomain(source: Record<string, unknown>): Job {
  const item = source as JobApiItem;

  return {
    id: typeof item.id === "string" ? item.id : "",
    name: typeof item.name === "string" ? item.name : "Untitled Job",
    clientId: typeof item.clientId === "string" ? item.clientId : "",
    clientName: typeof item.clientName === "string" ? item.clientName : "Unassigned",
    status: resolveStatus(item.status),
  };
}
