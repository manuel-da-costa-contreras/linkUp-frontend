import type { Client } from "@features/clients/domain/entities/Client";
import type { ClientRepository } from "@features/clients/domain/repositories/ClientRepository";

export class CreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  execute(orgId: string, name: string): Promise<Client> {
    return this.clientRepository.create(orgId, name);
  }
}

