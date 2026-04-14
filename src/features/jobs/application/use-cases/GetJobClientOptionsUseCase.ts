import type { JobClientOption } from "../../domain/entities/Job";
import type { JobRepository } from "../../domain/repositories/JobRepository";

export class GetJobClientOptionsUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  execute(orgId: string): Promise<JobClientOption[]> {
    return this.jobRepository.findClientOptions(orgId);
  }
}