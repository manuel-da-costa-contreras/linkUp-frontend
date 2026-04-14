import type { DashboardSnapshot } from "../../domain/entities/DashboardSnapshot";
import type { DashboardRepository } from "../../domain/repositories/DashboardRepository";

export class GetDashboardSnapshotUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  execute(orgId: string): Promise<DashboardSnapshot> {
    return this.dashboardRepository.getSnapshot(orgId);
  }
}