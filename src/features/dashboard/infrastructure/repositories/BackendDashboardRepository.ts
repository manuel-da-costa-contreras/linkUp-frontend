import { ApiError, apiRequest } from "@lib/api/httpClient";
import type { DashboardSnapshot } from "@features/dashboard/domain/entities/DashboardSnapshot";
import type { DashboardRepository } from "@features/dashboard/domain/repositories/DashboardRepository";
import { mapDashboardResponseToDomain } from "@features/dashboard/infrastructure/mappers/dashboard.mapper";

export class BackendDashboardRepository implements DashboardRepository {
  async getSnapshot(orgId: string): Promise<DashboardSnapshot> {
    const payload = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(orgId)}/dashboard/overview`,
    });

    return mapDashboardResponseToDomain(orgId, toObjectPayload(payload));
  }
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


