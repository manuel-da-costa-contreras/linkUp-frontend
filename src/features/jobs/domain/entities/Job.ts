export type JobStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";

export interface Job {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: JobStatus;
}

export interface JobClientOption {
  id: string;
  name: string;
}
