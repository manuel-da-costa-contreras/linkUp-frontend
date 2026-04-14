import type { JobAlertNotification } from "../entities/JobAlertNotification";

export interface NotificationsRepository {
  findJobAlerts(orgId: string): Promise<JobAlertNotification[]>;
  dismissNotification(orgId: string, notificationId: string): Promise<void>;
  dismissAllNotifications(orgId: string): Promise<void>;
}
