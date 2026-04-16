import type { Client } from "@features/clients/domain/entities/Client";
import type { ClientRepository } from "@features/clients/domain/repositories/ClientRepository";

export class UpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  execute(orgId: string, clientId: string, name: string): Promise<Client> {
    return this.clientRepository.update(orgId, clientId, name);
  }
}

