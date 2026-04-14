import type { Job } from "../../domain/entities/Job";
import type { JobRepository } from "../../domain/repositories/JobRepository";

export class CreateJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  execute(orgId: string, name: string, clientId: string): Promise<Job> {
    return this.jobRepository.create(orgId, {
      name,
      clientId,
      status: "PENDING",
    });
  }
}