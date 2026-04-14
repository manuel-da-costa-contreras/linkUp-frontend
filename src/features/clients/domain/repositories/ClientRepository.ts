import type { PaginatedResult, PaginationQuery } from "@/shared/pagination/types";
import type { Client } from "../entities/Client";

export type ClientSortBy =
  | "name"
  | "totalJobs"
  | "pendingJobs"
  | "inProgressJobs"
  | "completedJobs"
  | "createdAt";

export type SortDir = "asc" | "desc";

export interface ClientRepository {
  findAll(
    orgId: string,
    params: PaginationQuery & { search: string; sortBy: ClientSortBy; sortDir: SortDir }
  ): Promise<PaginatedResult<Client>>;
  create(orgId: string, name: string): Promise<Client>;
  update(orgId: string, clientId: string, name: string): Promise<Client>;
  deleteClient(orgId: string, clientId: string): Promise<void>;
}
