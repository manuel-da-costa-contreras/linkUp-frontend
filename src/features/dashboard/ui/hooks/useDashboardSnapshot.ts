"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { GetDashboardSnapshotUseCase } from "@features/dashboard/application/use-cases/GetDashboardSnapshotUseCase";
import { dashboardQueryKeys } from "@features/dashboard/application/use-cases/queryKeys";
import type { DashboardSnapshot } from "@features/dashboard/domain/entities/DashboardSnapshot";
import { BackendDashboardRepository } from "@features/dashboard/infrastructure/repositories/BackendDashboardRepository";

type UseDashboardSnapshotResult = {
  snapshot: DashboardSnapshot | null;
  loading: boolean;
  error: string | null;
};

export function useDashboardSnapshot(orgId: string): UseDashboardSnapshotResult {
  const useCase = useMemo(() => {
    const repository = new BackendDashboardRepository();
    return new GetDashboardSnapshotUseCase(repository);
  }, []);

  const query = useQuery({
    queryKey: dashboardQueryKeys.snapshot(orgId),
    queryFn: () => useCase.execute(orgId),
  });

  return {
    snapshot: query.data ?? null,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

