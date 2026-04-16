import type { JobClientOption } from "@features/jobs/domain/entities/Job";
import type { JobRepository } from "@features/jobs/domain/repositories/JobRepository";

export class GetJobClientOptionsUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  execute(orgId: string): Promise<JobClientOption[]> {
    return this.jobRepository.findClientOptions(orgId);
  }
}

