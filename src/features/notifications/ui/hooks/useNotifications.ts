"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { ApiError } from "@/lib/api/httpClient";
import { DismissAllNotificationsUseCase } from "../../application/use-cases/DismissAllNotificationsUseCase";
import { DismissNotificationUseCase } from "../../application/use-cases/DismissNotificationUseCase";
import { GetJobAlertsUseCase } from "../../application/use-cases/GetJobAlertsUseCase";
import { notificationsQueryKeys } from "../../application/use-cases/queryKeys";
import type { JobAlertNotification } from "../../domain/entities/JobAlertNotification";
import { BackendNotificationsRepository } from "../../infrastructure/repositories/BackendNotificationsRepository";
import { useNotificationsStream } from "./useNotificationsStream";

type UseNotificationsResult = {
  notifications: JobAlertNotification[];
  unreadCount: number;
  loading: boolean;
  dismissingOne: boolean;
  dismissingAll: boolean;
  error: string | null;
  actionError: string | null;
  dismissNotification: (notificationId: string) => Promise<boolean>;
  dismissAllNotifications: () => Promise<boolean>;
};

export function useNotifications(orgId: string): UseNotificationsResult {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const repository = useMemo(() => new BackendNotificationsRepository(), []);
  const getJobAlertsUseCase = useMemo(() => new GetJobAlertsUseCase(repository), [repository]);
  const dismissNotificationUseCase = useMemo(() => new DismissNotificationUseCase(repository), [repository]);
  const dismissAllNotificationsUseCase = useMemo(() => new DismissAllNotificationsUseCase(repository), [repository]);
  useNotificationsStream(orgId);

  const query = useQuery({
    queryKey: notificationsQueryKeys.jobAlerts(orgId),
    queryFn: () => getJobAlertsUseCase.execute(orgId),
    refetchInterval: 60000,
  });

  const dismissOneMutation = useMutation({
    mutationFn: (notificationId: string) => dismissNotificationUseCase.execute(orgId, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.jobAlerts(orgId) });
    },
  });

  const dismissAllMutation = useMutation({
    mutationFn: () => dismissAllNotificationsUseCase.execute(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.jobAlerts(orgId) });
    },
  });

  async function dismissNotification(notificationId: string) {
    try {
      await dismissOneMutation.mutateAsync(notificationId);
      return true;
    } catch {
      return false;
    }
  }

  async function dismissAllNotifications() {
    try {
      await dismissAllMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }

  return {
    notifications: query.data ?? [],
    unreadCount: (query.data ?? []).length,
    loading: query.isPending,
    dismissingOne: dismissOneMutation.isPending,
    dismissingAll: dismissAllMutation.isPending,
    error: query.error ? resolveNotificationsError(query.error, t("notifications.errors.load"), t) : null,
    actionError:
      dismissOneMutation.error || dismissAllMutation.error
        ? resolveNotificationsError(
            dismissOneMutation.error ?? dismissAllMutation.error,
            dismissOneMutation.error ? t("notifications.errors.dismiss") : t("notifications.errors.dismissAll"),
            t
          )
        : null,
    dismissNotification,
    dismissAllNotifications,
  };
}

const ERROR_CODE_TO_I18N_KEY: Record<string, string> = {
  UNAUTHORIZED: "notifications.errors.unauthorized",
  UNAUTHENTICATED: "notifications.errors.unauthorized",
  FORBIDDEN: "notifications.errors.forbidden",
  NOTIFICATION_NOT_FOUND: "notifications.errors.notificationNotFound",
  NOTIFICATIONS_NOT_FOUND: "notifications.errors.notificationNotFound",
  VALIDATION_ERROR: "notifications.errors.validation",
  INTERNAL_ERROR: "notifications.errors.internal",
};

function resolveNotificationsError(
  error: unknown,
  fallbackMessage: string,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  if (error instanceof ApiError) {
    if (error.code) {
      const key = ERROR_CODE_TO_I18N_KEY[error.code];
      if (key) {
        const params = buildErrorParams(error.details, t);
        return t(key, params);
      }
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

function buildErrorParams(
  details: Record<string, unknown> | null,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  const fieldRaw = typeof details?.field === "string" ? details.field : null;
  const reasonRaw = typeof details?.reason === "string" ? details.reason : null;

  const field = fieldRaw ? t(`notifications.fields.${fieldRaw}`) : t("notifications.fields.unknown");
  const reason = reasonRaw ? t(`notifications.reasons.${reasonRaw}`) : t("notifications.reasons.unknown");

  return { field, reason };
}
