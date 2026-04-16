import { mapDashboardResponseToDomain } from "@features/dashboard/infrastructure/mappers/dashboard.mapper";

describe("mapDashboardResponseToDomain", () => {
  it("maps complete payload to domain shape", () => {
    const snapshot = mapDashboardResponseToDomain("acme", {
      metrics: {
        activeUsers: { value: 10, delta: 5, periodLabel: "vs mes anterior" },
      },
      jobsTrend: [{ label: "Mon", open: 3, completed: 1 }],
      satisfactionBreakdown: { positive: 2, neutral: 1, negative: 0 },
      updatedAt: { _seconds: 1700000000, _nanoseconds: 500000000 },
    });

    expect(snapshot.orgId).toBe("acme");
    expect(snapshot.metrics.activeUsers).toEqual({
      value: 10,
      delta: 5,
      periodLabel: "vs mes anterior",
    });
    expect(snapshot.jobsTrend).toEqual([{ label: "Mon", open: 3, completed: 1 }]);
    expect(snapshot.satisfactionBreakdown).toEqual({
      positive: 2,
      neutral: 1,
      negative: 0,
    });
    expect(snapshot.updatedAt).toEqual(new Date(1700000000 * 1000 + 500));
  });

  it("uses safe defaults for empty payload", () => {
    const snapshot = mapDashboardResponseToDomain("acme", null);

    expect(snapshot.metrics.activeUsers.value).toBe(0);
    expect(snapshot.metrics.activeUsers.periodLabel).toBe("Sin periodo");
    expect(snapshot.jobsTrend).toEqual([]);
    expect(snapshot.satisfactionBreakdown).toEqual({
      positive: 0,
      neutral: 0,
      negative: 0,
    });
    expect(snapshot.updatedAt).toBeNull();
  });
});


