import type { Client } from "../../domain/entities/Client";
import type { ClientRepository } from "../../domain/repositories/ClientRepository";

export class UpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  execute(orgId: string, clientId: string, name: string): Promise<Client> {
    return this.clientRepository.update(orgId, clientId, name);
  }
}