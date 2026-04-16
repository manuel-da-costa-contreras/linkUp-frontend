import type { NotificationsRepository } from "@features/notifications/domain/repositories/NotificationsRepository";

export class DismissNotificationUseCase {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  execute(orgId: string, notificationId: string): Promise<void> {
    return this.notificationsRepository.dismissNotification(orgId, notificationId);
  }
}


