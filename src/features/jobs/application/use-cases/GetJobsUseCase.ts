import type { PaginatedResult, PaginationQuery } from "@/shared/pagination/types";
import type { Job } from "../../domain/entities/Job";
import type { JobRepository, JobSortBy, SortDir } from "../../domain/repositories/JobRepository";

export class GetJobsUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  execute(orgId: string, params: PaginationQuery & { sortBy: JobSortBy; sortDir: SortDir }): Promise<PaginatedResult<Job>> {
    return this.jobRepository.findAll(orgId, params);
  }
}
