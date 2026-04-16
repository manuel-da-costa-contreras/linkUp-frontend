import type { JobAlertNotification } from "@features/notifications/domain/entities/JobAlertNotification";
import type { NotificationsRepository } from "@features/notifications/domain/repositories/NotificationsRepository";

export class GetJobAlertsUseCase {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  execute(orgId: string): Promise<JobAlertNotification[]> {
    return this.notificationsRepository.findJobAlerts(orgId);
  }
}


