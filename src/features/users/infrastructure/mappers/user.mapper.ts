import type { User, UserRole } from "../../domain/entities/User";

type ApiTimestampObject = {
  _seconds?: number;
  _nanoseconds?: number;
};

type UserApiDocument = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: ApiTimestampObject | string | null;
};

function resolveRole(role: string | undefined): UserRole {
  if (role === "admin" || role === "editor" || role === "viewer") {
    return role;
  }

  return "viewer";
}

function resolveDate(value: ApiTimestampObject | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value._seconds !== "number") {
    return null;
  }

  return new Date(value._seconds * 1000 + Math.floor((value._nanoseconds ?? 0) / 1000000));
}

export function mapApiUserToDomain(
  id: string,
  data: Record<string, unknown>
): User {
  const source = data as UserApiDocument;

  return {
    id,
    name: source.name ?? "Sin nombre",
    email: source.email ?? "",
    role: resolveRole(source.role),
    createdAt: resolveDate(source.createdAt),
  };
}

export function mapDomainUserToApi(user: User): Record<string, unknown> {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
  };
}