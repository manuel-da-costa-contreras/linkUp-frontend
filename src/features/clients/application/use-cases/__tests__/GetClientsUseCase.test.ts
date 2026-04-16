import type { ClientRepository } from "@features/clients/domain/repositories/ClientRepository";
import { GetClientsUseCase } from "@features/clients/application/use-cases/GetClientsUseCase";

describe("GetClientsUseCase", () => {
  it("delegates to repository with the same params", async () => {
    const repository: jest.Mocked<ClientRepository> = {
      findAll: jest.fn().mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }),
      create: jest.fn(),
      update: jest.fn(),
      deleteClient: jest.fn(),
    };

    const useCase = new GetClientsUseCase(repository);
    const params = {
      page: 1,
      pageSize: 10,
      search: "",
      sortBy: "name" as const,
      sortDir: "asc" as const,
    };

    await useCase.execute("acme", params);

    expect(repository.findAll).toHaveBeenCalledWith("acme", params);
  });
});



