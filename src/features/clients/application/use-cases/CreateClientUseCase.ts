import type { Client } from "../../domain/entities/Client";
import type { ClientRepository } from "../../domain/repositories/ClientRepository";

export class CreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  execute(orgId: string, name: string): Promise<Client> {
    return this.clientRepository.create(orgId, name);
  }
}