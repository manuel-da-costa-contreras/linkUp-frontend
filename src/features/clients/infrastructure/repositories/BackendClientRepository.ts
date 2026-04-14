import { ApiError, apiRequest } from "@/lib/api/httpClient";
import type { PaginatedResult, PaginationMeta, PaginationQuery } from "@/shared/pagination/types";
import type { Client } from "../../domain/entities/Client";
import type { ClientRepository, ClientSortBy, SortDir } from "../../domain/repositories/ClientRepository";
import { mapClientApiToDomain } from "../mappers/client.mapper";

export class BackendClientRepository implements ClientRepository {
  async findAll(
    orgId: string,
    params: PaginationQuery & { search: string; sortBy: ClientSortBy; sortDir: SortDir }
  ): Promise<PaginatedResult<Client>> {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      sortBy: params.sortBy,
      sortDir: params.sortDir,
    });

    if (params.search.trim()) {
      query.set("search", params.search.trim());
    }

    const payload = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(orgId)}/clients?${query.toString()}`,
    });

    return toPaginatedClientsPayload(payload);
  }

  async create(orgId: string, name: string): Promise<Client> {
    const payload = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(orgId)}/clients`,
      method: "POST",
      body: { name },
    });

    return mapClientApiToDomain(toObjectPayload(payload));
  }

  async update(orgId: string, clientId: string, name: string): Promise<Client> {
    const payload = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(orgId)}/clients/${encodeURIComponent(clientId)}`,
      method: "PUT",
      body: { name },
    });

    return mapClientApiToDomain(toObjectPayload(payload));
  }

  async deleteClient(orgId: string, clientId: string): Promise<void> {
    await apiRequest<void>({
      path: `/organizations/${encodeURIComponent(orgId)}/clients/${encodeURIComponent(clientId)}`,
      method: "DELETE",
    });
  }
}

function toPaginatedClientsPayload(payload: unknown): PaginatedResult<Client> {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const candidate = payload as {
      data?: unknown;
      pagination?: unknown;
    };

    const data = Array.isArray(candidate.data) ? candidate.data : null;
    const pagination = candidate.pagination && typeof candidate.pagination === "object" ? candidate.pagination : null;

    if (data && pagination) {
      return {
        data: data.map((item) => mapClientApiToDomain(item as Record<string, unknown>)),
        pagination: normalizePaginationMeta(pagination as Record<string, unknown>),
      };
    }
  }

  const fallbackData = toArrayPayload(payload).map(mapClientApiToDomain);

  return {
    data: fallbackData,
    pagination: {
      page: 1,
      pageSize: fallbackData.length || 10,
      totalItems: fallbackData.length,
      totalPages: fallbackData.length > 0 ? 1 : 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

function normalizePaginationMeta(source: Record<string, unknown>): PaginationMeta {
  const page = toPositiveInt(source.page, 1);
  const pageSize = toPositiveInt(source.pageSize, 10);
  const totalItems = toNonNegativeInt(source.totalItems, 0);
  const totalPages = toNonNegativeInt(source.totalPages, 0);
  const hasNextPage = typeof source.hasNextPage === "boolean" ? source.hasNextPage : page < totalPages;
  const hasPrevPage = typeof source.hasPrevPage === "boolean" ? source.hasPrevPage : page > 1;

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}

function toPositiveInt(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;
}

function toNonNegativeInt(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : fallback;
}

function toArrayPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload as Array<Record<string, unknown>>;
  }

  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: Array<Record<string, unknown>> }).data;
  }

  throw new ApiError(500, null, null, "Invalid array payload format.");
}

function toObjectPayload(payload: unknown) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    if ("data" in payload && payload.data && typeof payload.data === "object") {
      return payload.data as Record<string, unknown>;
    }

    return payload as Record<string, unknown>;
  }

  throw new ApiError(500, null, null, "Invalid object payload format.");
}
