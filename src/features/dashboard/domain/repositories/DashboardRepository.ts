import type { DashboardSnapshot } from "@features/dashboard/domain/entities/DashboardSnapshot";

export interface DashboardRepository {
  getSnapshot(orgId: string): Promise<DashboardSnapshot>;
}

