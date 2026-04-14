import type { Job, JobStatus } from "../../domain/entities/Job";
import type { JobRepository } from "../../domain/repositories/JobRepository";

type UpdateJobStatusPayload = {
  status: JobStatus;
  reason?: string;
  rating?: number;
};

export class UpdateJobStatusUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  execute(orgId: string, jobId: string, payload: UpdateJobStatusPayload): Promise<Job> {
    return this.jobRepository.updateStatus(orgId, jobId, payload);
  }
}
