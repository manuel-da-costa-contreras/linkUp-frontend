import type { PaginatedResult, PaginationQuery } from "@shared/pagination/types";
import type { Client } from "@features/clients/domain/entities/Client";
import type { ClientRepository, ClientSortBy, SortDir } from "@features/clients/domain/repositories/ClientRepository";

export class GetClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  execute(
    orgId: string,
    params: PaginationQuery & { search: string; sortBy: ClientSortBy; sortDir: SortDir }
  ): Promise<PaginatedResult<Client>> {
    return this.clientRepository.findAll(orgId, params);
  }
}



