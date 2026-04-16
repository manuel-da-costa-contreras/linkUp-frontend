import type { Job, JobStatus } from "@features/jobs/domain/entities/Job";

type JobApiItem = {
  id?: string;
  jobId?: string;
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
  const resolvedId =
    typeof item.id === "string" && item.id.trim()
      ? item.id
      : typeof item.jobId === "string" && item.jobId.trim()
        ? item.jobId
        : "";

  return {
    id: resolvedId,
    name: typeof item.name === "string" ? item.name : "Untitled Job",
    clientId: typeof item.clientId === "string" ? item.clientId : "",
    clientName: typeof item.clientName === "string" ? item.clientName : "Unassigned",
    status: resolveStatus(item.status),
  };
}


