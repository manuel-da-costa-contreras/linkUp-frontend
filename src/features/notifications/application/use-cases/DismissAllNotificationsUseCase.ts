import type { NotificationsRepository } from "../../domain/repositories/NotificationsRepository";

export class DismissAllNotificationsUseCase {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  execute(orgId: string): Promise<void> {
    return this.notificationsRepository.dismissAllNotifications(orgId);
  }
}
