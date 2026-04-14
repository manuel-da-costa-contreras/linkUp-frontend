import type { PaginationQuery, PaginatedResult } from "@/shared/pagination/types";
import type { Job, JobClientOption, JobStatus } from "../entities/Job";

export type JobSortBy = "name" | "clientName" | "status" | "createdAt" | "updatedAt";

export type SortDir = "asc" | "desc";

export interface JobRepository {
  findAll(
    orgId: string,
    params: PaginationQuery & { sortBy: JobSortBy; sortDir: SortDir }
  ): Promise<PaginatedResult<Job>>;
  findClientOptions(orgId: string): Promise<JobClientOption[]>;
  create(orgId: string, payload: { name: string; clientId: string; status: "PENDING" }): Promise<Job>;
  updateStatus(
    orgId: string,
    jobId: string,
    payload: { status: JobStatus; reason?: string; rating?: number }
  ): Promise<Job>;
}
