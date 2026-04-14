import type { ClientRepository } from "../../domain/repositories/ClientRepository";

export class DeleteClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  execute(orgId: string, clientId: string): Promise<void> {
    return this.clientRepository.deleteClient(orgId, clientId);
  }
}