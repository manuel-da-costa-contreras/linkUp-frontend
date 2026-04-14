"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { GetUsersUseCase } from "../../application/use-cases/GetUsersUseCase";
import { usersQueryKeys } from "../../application/use-cases/queryKeys";
import type { User } from "../../domain/entities/User";
import { BackendUserRepository } from "../../infrastructure/repositories/BackendUserRepository";

type UseUsersResult = {
  users: User[];
  loading: boolean;
  error: string | null;
};

const defaultOrgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ?? "acme";

export function useUsers(): UseUsersResult {
  const { t } = useI18n();

  const useCase = useMemo(() => {
    const repository = new BackendUserRepository();
    return new GetUsersUseCase(repository);
  }, []);

  const query = useQuery({
    queryKey: usersQueryKeys.list(defaultOrgId),
    queryFn: () => useCase.execute(),
  });

  return {
    users: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : t("users.errors.load"),
  };
}