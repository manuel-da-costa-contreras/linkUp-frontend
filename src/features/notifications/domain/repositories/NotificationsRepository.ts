import type { JobAlertNotification } from "@features/notifications/domain/entities/JobAlertNotification";

export interface NotificationsRepository {
  findJobAlerts(orgId: string): Promise<JobAlertNotification[]>;
  dismissNotification(orgId: string, notificationId: string): Promise<void>;
  dismissAllNotifications(orgId: string): Promise<void>;
}


