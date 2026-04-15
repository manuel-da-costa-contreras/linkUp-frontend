"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isAuthEnabled } from "@/lib/auth";
import { ApiError, apiRequest } from "@/lib/api/httpClient";
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

type SseTokenPayload = {
  success?: boolean;
  data?: {
    token?: string;
    ttlSeconds?: number;
  };
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

function buildStreamUrl(orgId: string, token?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const query = new URLSearchParams({
    status: "active",
    types: "JOB_PENDING,JOB_REJECTED",
  });

  if (token) {
    query.set("token", token);
  }

  return `${baseUrl}/organizations/${encodeURIComponent(orgId)}/notifications/stream?${query.toString()}`;
}

function parseEventData<TData>(raw: MessageEvent<string>) {
  try {
    return JSON.parse(raw.data) as StreamEventEnvelope<TData>;
  } catch {
    return null;
  }
}

async function requestSseToken(orgId: string) {
  const payload = await apiRequest<unknown>({
    path: "/api/auth/sse-token",
    method: "POST",
    body: { orgId },
  });

  const typed = payload as SseTokenPayload;
  const token = typed?.data?.token;
  const ttlSeconds = typed?.data?.ttlSeconds;

  if (!token || typeof token !== "string") {
    throw new Error("Invalid SSE token payload.");
  }

  return {
    token,
    ttlSeconds: typeof ttlSeconds === "number" && ttlSeconds > 0 ? ttlSeconds : 300,
  };
}

export function useNotificationsStream(orgId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orgId) {
      return;
    }

    const queryKey = notificationsQueryKeys.jobAlerts(orgId);
    let stream: EventSource | null = null;
    let renewTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

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

    const closeStream = () => {
      if (stream) {
        stream.onmessage = null;
        stream.onopen = null;
        stream.close();
        stream = null;
      }
    };

    const clearTimers = () => {
      if (renewTimer) {
        clearTimeout(renewTimer);
        renewTimer = null;
      }

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const scheduleReconnect = (delayMs = 3000) => {
      if (cancelled || reconnectTimer) {
        return;
      }

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void connect();
      }, delayMs);
    };

    const attachListeners = () => {
      if (!stream) {
        return;
      }

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

      stream.onopen = () => {
        queryClient.invalidateQueries({ queryKey });
      };

      stream.onmessage = onMessage;
      stream.addEventListener("notification.upsert", onUpsert as EventListener);
      stream.addEventListener("notification.dismissed", onDismissed as EventListener);
      stream.addEventListener("notification.dismissed_all", onDismissedAll as EventListener);
      stream.onerror = () => {
        closeStream();
        scheduleReconnect(2000);
      };
    };

    const connect = async () => {
      if (cancelled) {
        return;
      }

      clearTimers();
      closeStream();

      try {
        let token: string | undefined;
        let ttlSeconds = 300;

        if (isAuthEnabled()) {
          const sseToken = await requestSseToken(orgId);
          token = sseToken.token;
          ttlSeconds = sseToken.ttlSeconds;
        }

        if (cancelled) {
          return;
        }

        stream = new EventSource(buildStreamUrl(orgId, token));
        attachListeners();

        if (isAuthEnabled()) {
          const renewInMs = Math.max((ttlSeconds - 20) * 1000, 15000);
          renewTimer = setTimeout(() => {
            void connect();
          }, renewInMs);
        }
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          // Phase B authorization can deny stream token until org membership/role is granted.
          // Stop aggressive retries to avoid request storms; user can refresh after permissions are fixed.
          return;
        }

        scheduleReconnect(3000);
      }
    };

    void connect();

    return () => {
      cancelled = true;
      clearTimers();
      closeStream();
    };
  }, [orgId, queryClient]);
}
