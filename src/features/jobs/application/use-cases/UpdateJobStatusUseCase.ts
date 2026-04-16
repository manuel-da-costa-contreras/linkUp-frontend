import type { Job, JobStatus } from "@features/jobs/domain/entities/Job";
import type { JobRepository } from "@features/jobs/domain/repositories/JobRepository";

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


