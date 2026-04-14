import { ApiError, apiRequest } from "@/lib/api/httpClient";
import type { User } from "../../domain/entities/User";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import { mapApiUserToDomain, mapDomainUserToApi } from "../mappers/user.mapper";

const defaultOrgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ?? "demo-org";

export class BackendUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const payload = await apiRequest<unknown>({
      path: `/organizations/${encodeURIComponent(defaultOrgId)}/users`,
    });

    return toArrayPayload(payload).map((user) => {
      const id = typeof user.id === "string" ? user.id : "";
      return mapApiUserToDomain(id, user);
    });
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const payload = await apiRequest<unknown>({
        path: `/organizations/${encodeURIComponent(defaultOrgId)}/users/${encodeURIComponent(userId)}`,
      });

      return mapApiUserToDomain(userId, toObjectPayload(payload));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }

  async save(user: User): Promise<void> {
    await apiRequest<void>({
      path: `/organizations/${encodeURIComponent(defaultOrgId)}/users/${encodeURIComponent(user.id)}`,
      method: "PUT",
      body: mapDomainUserToApi(user),
    });
  }
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