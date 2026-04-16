import type { DashboardSnapshot } from "@features/dashboard/domain/entities/DashboardSnapshot";
import type { DashboardRepository } from "@features/dashboard/domain/repositories/DashboardRepository";

export class GetDashboardSnapshotUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  execute(orgId: string): Promise<DashboardSnapshot> {
    return this.dashboardRepository.getSnapshot(orgId);
  }
}

