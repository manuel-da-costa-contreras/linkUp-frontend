export interface Client {
  id: string;
  name: string;
  totalJobs: number;
  pendingJobs: number;
  inProgressJobs: number;
  completedJobs: number;
}