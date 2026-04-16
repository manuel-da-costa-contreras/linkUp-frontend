import { mapJobApiToDomain } from "@features/jobs/infrastructure/mappers/job.mapper";

describe("mapJobApiToDomain", () => {
  it("maps valid fields as expected", () => {
    expect(
      mapJobApiToDomain({
        id: "job_1",
        name: "Migration",
        clientId: "cl_1",
        clientName: "Acme",
        status: "IN_PROGRESS",
      })
    ).toEqual({
      id: "job_1",
      name: "Migration",
      clientId: "cl_1",
      clientName: "Acme",
      status: "IN_PROGRESS",
    });
  });

  it("falls back to defaults when payload is incomplete", () => {
    expect(
      mapJobApiToDomain({
        status: "UNKNOWN",
      })
    ).toEqual({
      id: "",
      name: "Untitled Job",
      clientId: "",
      clientName: "Unassigned",
      status: "PENDING",
    });
  });

  it("uses jobId when id is missing", () => {
    expect(
      mapJobApiToDomain({
        jobId: "job_legacy_1",
        name: "Legacy migration",
      })
    ).toEqual({
      id: "job_legacy_1",
      name: "Legacy migration",
      clientId: "",
      clientName: "Unassigned",
      status: "PENDING",
    });
  });
});


