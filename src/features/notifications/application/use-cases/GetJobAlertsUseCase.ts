import type { JobAlertNotification } from "../../domain/entities/JobAlertNotification";
import type { NotificationsRepository } from "../../domain/repositories/NotificationsRepository";

export class GetJobAlertsUseCase {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  execute(orgId: string): Promise<JobAlertNotification[]> {
    return this.notificationsRepository.findJobAlerts(orgId);
  }
}
