import type { PaginationQuery, PaginatedResult } from "@shared/pagination/types";
import type { Job, JobClientOption, JobStatus } from "@features/jobs/domain/entities/Job";

export type JobSortBy = "name" | "clientName" | "status" | "createdAt" | "updatedAt";

export type SortDir = "asc" | "desc";

export interface JobRepository {
  findAll(
    orgId: string,
    params: PaginationQuery & { search: string; sortBy: JobSortBy; sortDir: SortDir }
  ): Promise<PaginatedResult<Job>>;
  findClientOptions(orgId: string): Promise<JobClientOption[]>;
  create(orgId: string, payload: { name: string; clientId: string; status: "PENDING" }): Promise<Job>;
  updateStatus(
    orgId: string,
    jobId: string,
    payload: { status: JobStatus; reason?: string; rating?: number }
  ): Promise<Job>;
  deleteJob(orgId: string, jobId: string): Promise<void>;
}



