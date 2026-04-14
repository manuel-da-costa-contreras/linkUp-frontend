import type { DashboardSnapshot } from "../entities/DashboardSnapshot";

export interface DashboardRepository {
  getSnapshot(orgId: string): Promise<DashboardSnapshot>;
}