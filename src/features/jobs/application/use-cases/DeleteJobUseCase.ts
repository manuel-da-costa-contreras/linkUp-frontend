import type { JobRepository } from "@features/jobs/domain/repositories/JobRepository";

export class DeleteJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  execute(orgId: string, jobId: string): Promise<void> {
    return this.jobRepository.deleteJob(orgId, jobId);
  }
}

