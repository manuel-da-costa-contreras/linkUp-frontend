"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isAuthEnabled } from "@/lib/auth";
import { notificationsQueryKeys } from "../../application/use-cases/queryKeys";
import type { JobAlertNotification, JobAlertStatus } from "../../domain/entities/JobAlertNotification";

type StreamEventEnvelope<TData> = {
  type?: string;
  orgId?: string;
  timestamp?: string;
  data?: TData;
};

type UpsertData = {
  id?: string;
  jobId?: string;
  jobName?: string;
  clientName?: string;
  status?: string;
  notificationType?: string;
  active?: boolean;
};

type DismissedData = {
  id?: string;
  jobId?: string;
};

function resolveStatus(value?: string, notificationType?: string): JobAlertStatus | null {
  if (value === "PENDING" || notificationType === "JOB_PENDING") {
    return "PENDING";
  }

  if (value === "REJECTED" || notificationType === "JOB_REJECTED") {
    return "REJECTED";
  }

  return null;
}

function buildStreamUrl(orgId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const query = new URLSearchParams({
    status: "active",
    types: "JOB_PENDING,JOB_REJECTED",
  });

  return `${baseUrl}/organizations/${encodeURIComponent(orgId)}/notifications/stream?${query.toString()}`;
}

function parseEventData<TData>(raw: MessageEvent<string>) {
  try {
    return JSON.parse(raw.data) as StreamEventEnvelope<TData>;
  } catch {
    return null;
  }
}

export function useNotificationsStream(orgId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orgId) {
      return;
    }

    // In Phase A, backend protects SSE with Bearer and EventSource cannot send custom Authorization headers.
    // We keep polling as fallback until Phase C introduces a short-lived SSE token in query params.
    if (isAuthEnabled()) {
      return;
    }

    const stream = new EventSource(buildStreamUrl(orgId));
    const queryKey = notificationsQueryKeys.jobAlerts(orgId);

    const applyUpsert = (incoming: UpsertData) => {
      const id = typeof incoming.id === "string" ? incoming.id : "";
      if (!id) {
        return;
      }

      const status = resolveStatus(incoming.status, incoming.notificationType);
      if (!status || incoming.active === false) {
        queryClient.setQueryData<JobAlertNotification[]>(queryKey, (current = []) =>
          current.filter((item) => item.id !== id)
        );
        return;
      }

      const nextNotification: JobAlertNotification = {
        id,
        jobId: typeof incoming.jobId === "string" ? incoming.jobId : id,
        jobName: typeof incoming.jobName === "string" ? incoming.jobName : "Untitled job",
        clientName: typeof incoming.clientName === "string" ? incoming.clientName : "Unassigned",
        status,
      };

      queryClient.setQueryData<JobAlertNotification[]>(queryKey, (current = []) => {
        const index = current.findIndex((item) => item.id === id);
        if (index === -1) {
          return [nextNotification, ...current];
        }

        const copy = [...current];
        copy[index] = nextNotification;
        return copy;
      });
    };

    const applyDismissed = (incoming: DismissedData) => {
      const id = typeof incoming.id === "string" ? incoming.id : null;
      const jobId = typeof incoming.jobId === "string" ? incoming.jobId : null;

      if (!id && !jobId) {
        return;
      }

      queryClient.setQueryData<JobAlertNotification[]>(queryKey, (current = []) =>
        current.filter((item) => item.id !== id && item.jobId !== jobId)
      );
    };

    const applyDismissedAll = () => {
      queryClient.setQueryData<JobAlertNotification[]>(queryKey, []);
    };

    const onUpsert = (event: MessageEvent<string>) => {
      const payload = parseEventData<UpsertData>(event);
      const data = payload?.data ?? ((payload as UpsertData | null) ?? null);
      if (!data) {
        return;
      }

      applyUpsert(data);
      queryClient.invalidateQueries({ queryKey });
    };

    const onDismissed = (event: MessageEvent<string>) => {
      const payload = parseEventData<DismissedData>(event);
      const data = payload?.data ?? ((payload as DismissedData | null) ?? null);
      if (!data) {
        return;
      }

      applyDismissed(data);
      queryClient.invalidateQueries({ queryKey });
    };

    const onDismissedAll = () => {
      applyDismissedAll();
      queryClient.invalidateQueries({ queryKey });
    };

    const onMessage = (event: MessageEvent<string>) => {
      const payload = parseEventData<Record<string, unknown>>(event);
      if (!payload) {
        return;
      }

      const eventType = typeof payload.type === "string" ? payload.type : null;
      if (!eventType) {
        return;
      }

      if (eventType === "notification.upsert") {
        const data = (payload.data as UpsertData | undefined) ?? (payload as unknown as UpsertData);
        applyUpsert(data);
        queryClient.invalidateQueries({ queryKey });
        return;
      }

      if (eventType === "notification.dismissed") {
        const data = (payload.data as DismissedData | undefined) ?? (payload as unknown as DismissedData);
        applyDismissed(data);
        queryClient.invalidateQueries({ queryKey });
        return;
      }

      if (eventType === "notification.dismissed_all") {
        applyDismissedAll();
        queryClient.invalidateQueries({ queryKey });
      }
    };

    const onOpen = () => {
      queryClient.invalidateQueries({ queryKey });
    };

    const onError = () => {
      // EventSource retries automatically.
    };

    stream.onmessage = onMessage;
    stream.onopen = onOpen;
    stream.addEventListener("notification.upsert", onUpsert as EventListener);
    stream.addEventListener("notification.dismissed", onDismissed as EventListener);
    stream.addEventListener("notification.dismissed_all", onDismissedAll as EventListener);
    stream.addEventListener("error", onError as EventListener);

    return () => {
      stream.onmessage = null;
      stream.onopen = null;
      stream.removeEventListener("notification.upsert", onUpsert as EventListener);
      stream.removeEventListener("notification.dismissed", onDismissed as EventListener);
      stream.removeEventListener("notification.dismissed_all", onDismissedAll as EventListener);
      stream.removeEventListener("error", onError as EventListener);
      stream.close();
    };
  }, [orgId, queryClient]);
}
