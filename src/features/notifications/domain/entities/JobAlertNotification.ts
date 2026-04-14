export type JobAlertStatus = "PENDING" | "REJECTED";

export interface JobAlertNotification {
  id: string;
  jobId: string;
  jobName: string;
  clientName: string;
  status: JobAlertStatus;
}

