import { ApiError, apiRequest } from "@/lib/api/httpClient";
import type { PaginatedResult, PaginationMeta, PaginationQuery } from "@/shared/pagination/types";
import type { Job, JobClientOption, JobStatus } from "../../domain/entities/Job";
import type { JobRepository, JobSortBy, SortDir } from "../../domain/repositories/JobRepository";
import { mapJobApiToDomain } from "../mappers/job.mapper";

export class BackendJobRepository implements JobRepository {
  async findAll(
    orgId: string,
    params: PaginationQuery & { sortBy: JobSortBy; sortDir: SortDir }
  ): Promise<PaginatedResult<Job>> {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      sortBy: params.sortBy,
      sortDir: params.sortDir,
    });

    const payload = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(orgId)}/jobs?${query.toString()}`,
    });

    return toPaginatedJobsPayload(payload);
  }

  async findClientOptions(orgId: string): Promise<JobClientOption[]> {
    const payload = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(orgId)}/clients/options`,
    });

    return toArrayPayload(payload)
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : "",
        name: typeof item.name === "string" ? item.name : "",
      }))
      .filter((item) => item.id && item.name);
  }

  async create(orgId: string, payload: { name: string; clientId: string; status: "PENDING" }): Promise<Job> {
    const body = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(orgId)}/jobs`,
      method: "POST",
      body: payload,
    });

    return mapJobApiToDomain(toObjectPayload(body));
  }

  async updateStatus(
    orgId: string,
    jobId: string,
    payload: { status: JobStatus; reason?: string; rating?: number }
  ): Promise<Job> {
    const body = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(orgId)}/jobs/${encodeURIComponent(jobId)}/status`,
      method: "PATCH",
      body: payload,
    });

    return mapJobApiToDomain(toObjectPayload(body));
  }
}

function toPaginatedJobsPayload(payload: unknown): PaginatedResult<Job> {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const candidate = payload as {
      data?: unknown;
      pagination?: unknown;
    };

    const data = Array.isArray(candidate.data) ? candidate.data : null;
    const pagination = candidate.pagination && typeof candidate.pagination === "object" ? candidate.pagination : null;

    if (data && pagination) {
      return {
        data: data.map((item) => mapJobApiToDomain(item as Record<string, unknown>)),
        pagination: normalizePaginationMeta(pagination as Record<string, unknown>),
      };
    }
  }

  const fallbackData = toArrayPayload(payload).map(mapJobApiToDomain);

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
