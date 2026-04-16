import { apiRequest } from "@lib/api/httpClient";
import { BackendClientRepository } from "@features/clients/infrastructure/repositories/BackendClientRepository";

jest.mock("@lib/api/httpClient", () => {
  const actual = jest.requireActual("@lib/api/httpClient");
  return {
    ...actual,
    apiRequest: jest.fn(),
  };
});

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe("BackendClientRepository", () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  it("builds list query and maps paginated response", async () => {
    mockedApiRequest.mockResolvedValue({
      data: [
        {
          id: "cl_1",
          name: "Acme Corp",
          totalJobs: 3,
          pendingJobs: 1,
          inProgressJobs: 1,
          completedJobs: 1,
        },
      ],
      pagination: {
        page: 2,
        pageSize: 10,
        totalItems: 12,
        totalPages: 2,
        hasNextPage: false,
        hasPrevPage: true,
      },
    });

    const repository = new BackendClientRepository();
    const result = await repository.findAll("acme org", {
      page: 2,
      pageSize: 10,
      search: "  acme ",
      sortBy: "name",
      sortDir: "asc",
    });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      path: "/organizations/acme%20org/clients?page=2&pageSize=10&sortBy=name&sortDir=asc&search=acme",
    });
    expect(result.data[0]).toEqual({
      id: "cl_1",
      name: "Acme Corp",
      totalJobs: 3,
      pendingJobs: 1,
      inProgressJobs: 1,
      completedJobs: 1,
    });
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalItems).toBe(12);
  });

  it("maps create response from { data } envelope", async () => {
    mockedApiRequest.mockResolvedValue({
      data: {
        id: "cl_2",
        name: "Globex",
        totalJobs: 0,
        pendingJobs: 0,
        inProgressJobs: 0,
        completedJobs: 0,
      },
    });

    const repository = new BackendClientRepository();
    const created = await repository.create("acme", "Globex");

    expect(mockedApiRequest).toHaveBeenCalledWith({
      path: "/organizations/acme/clients",
      method: "POST",
      body: { name: "Globex" },
    });
    expect(created).toEqual({
      id: "cl_2",
      name: "Globex",
      totalJobs: 0,
      pendingJobs: 0,
      inProgressJobs: 0,
      completedJobs: 0,
    });
  });
});



