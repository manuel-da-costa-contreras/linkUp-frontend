import { ApiError, apiRequest } from "@lib/api/httpClient";

jest.mock("@lib/auth", () => ({
  getCurrentIdToken: jest.fn(),
  isAuthEnabled: jest.fn(() => true),
}));

const { getCurrentIdToken } = jest.requireMock("@lib/auth") as {
  getCurrentIdToken: jest.Mock;
};

function mockJsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("apiRequest", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("sends auth/content headers and returns parsed JSON", async () => {
    getCurrentIdToken.mockResolvedValue("token-123");
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(200, { success: true, data: { id: "1" } })
    );

    const result = await apiRequest<{ success: boolean; data: { id: string } }>({
      path: "/organizations/acme/clients",
      method: "POST",
      body: { name: "Acme Corp" },
    });

    expect(result).toEqual({ success: true, data: { id: "1" } });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = options.headers as Headers;

    expect(url).toBe("http://localhost:3001/organizations/acme/clients");
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ name: "Acme Corp" }));
    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("returns undefined for 204 responses", async () => {
    getCurrentIdToken.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(mockJsonResponse(204, null));

    const result = await apiRequest<void>({
      path: "/organizations/acme/notifications/dismiss-all",
      method: "POST",
    });

    expect(result).toBeUndefined();
  });

  it("throws ApiError with backend code and details", async () => {
    getCurrentIdToken.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(409, {
        success: false,
        error: {
          code: "CLIENT_NAME_EXISTS",
          message: "Client name already exists",
          details: { field: "name" },
        },
      })
    );

    await expect(
      apiRequest({
        path: "/organizations/acme/clients",
        method: "POST",
        body: { name: "Acme" },
      })
    ).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: "ApiError",
        status: 409,
        code: "CLIENT_NAME_EXISTS",
        details: { field: "name" },
        message: "Client name already exists",
      })
    );
  });
});

