import { getCurrentIdToken, isAuthEnabled } from "@lib/auth";

export type ApiErrorPayload = {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
  message?: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
    public readonly details: Record<string, unknown> | null,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
};

const defaultApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function apiRequest<T>({
  path,
  method = "GET",
  body,
  headers,
  cache = "no-store",
}: RequestOptions): Promise<T> {
  const token = await getCurrentIdToken();
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${defaultApiBaseUrl}${path}`, {
    method,
    cache,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401 && isAuthEnabled() && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:unauthorized"));
    }

    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function toApiError(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    const code = payload.error?.code ?? null;
    const details = payload.error?.details ?? null;
    const message =
      payload.error?.message ?? payload.message ?? `Request failed with status ${response.status}`;

    return new ApiError(response.status, code, details, message);
  } catch {
    return new ApiError(response.status, null, null, `Request failed with status ${response.status}`);
  }
}

