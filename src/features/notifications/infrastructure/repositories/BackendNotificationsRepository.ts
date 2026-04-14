import { ApiError, apiRequest } from "@/lib/api/httpClient";
import type { JobAlertNotification, JobAlertStatus } from "../../domain/entities/JobAlertNotification";
import type { NotificationsRepository } from "../../domain/repositories/NotificationsRepository";

type NotificationApiItem = {
  id?: string;
  jobId?: string;
  jobName?: string;
  clientName?: string;
  type?: string;
  status?: string;
};

export class BackendNotificationsRepository implements NotificationsRepository {
  async findJobAlerts(orgId: string): Promise<JobAlertNotification[]> {
    const payload = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(orgId)}/notifications?status=active&types=JOB_PENDING,JOB_REJECTED&page=1&pageSize=25`,
    });

    return toArrayPayload(payload)
      .map((item) => {
        const notification = item as NotificationApiItem;
        const status = normalizeStatus(notification.status ?? notification.type);

        if (!status) {
          return null;
        }

        const id = typeof notification.id === "string" ? notification.id : "";
        if (!id) {
          return null;
        }

        const jobId = typeof notification.jobId === "string" ? notification.jobId : id;

        return {
          id,
          jobId,
          jobName: typeof notification.jobName === "string" ? notification.jobName : "Untitled job",
          clientName: typeof notification.clientName === "string" ? notification.clientName : "Unassigned",
          status,
        } satisfies JobAlertNotification;
      })
      .filter((item): item is JobAlertNotification => item !== null);
  }

  async dismissNotification(orgId: string, notificationId: string): Promise<void> {
    await apiRequest<void>({
      path: `/organizations/${encodeURIComponent(orgId)}/notifications/${encodeURIComponent(notificationId)}/dismiss`,
      method: "PATCH",
    });
  }

  async dismissAllNotifications(orgId: string): Promise<void> {
    await apiRequest<void>({
      path: `/organizations/${encodeURIComponent(orgId)}/notifications/dismiss-all`,
      method: "POST",
    });
  }
}

function normalizeStatus(value: unknown): JobAlertStatus | null {
  if (value === "PENDING" || value === "JOB_PENDING" || value === "JOB_ALERT_PENDING") {
    return "PENDING";
  }

  if (value === "REJECTED" || value === "JOB_REJECTED" || value === "JOB_ALERT_REJECTED") {
    return "REJECTED";
  }

  return null;
}

function toArrayPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload as Array<Record<string, unknown>>;
  }

  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: Array<Record<string, unknown>> }).data;
  }

  throw new ApiError(500, null, null, "Invalid notifications payload format.");
}
