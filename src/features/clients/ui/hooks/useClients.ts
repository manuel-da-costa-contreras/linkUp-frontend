"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { ApiError } from "@/lib/api/httpClient";
import type { PaginationMeta } from "@/shared/pagination/types";
import { useDebounce } from "@/utils/useDebounce";
import { CreateClientUseCase } from "../../application/use-cases/CreateClientUseCase";
import { DeleteClientUseCase } from "../../application/use-cases/DeleteClientUseCase";
import { GetClientsUseCase } from "../../application/use-cases/GetClientsUseCase";
import { clientsQueryKeys } from "../../application/use-cases/queryKeys";
import { UpdateClientUseCase } from "../../application/use-cases/UpdateClientUseCase";
import type { Client } from "../../domain/entities/Client";
import type { ClientSortBy, SortDir } from "../../domain/repositories/ClientRepository";
import { BackendClientRepository } from "../../infrastructure/repositories/BackendClientRepository";

type UseClientsResult = {
  search: string;
  setSearch: (value: string) => void;
  sortBy: ClientSortBy;
  sortDir: SortDir;
  toggleSort: (field: ClientSortBy) => void;
  pagination: PaginationMeta;
  pageSizeOptions: number[];
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clients: Client[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createError: string | null;
  createClient: (name: string) => Promise<boolean>;
  editing: boolean;
  editError: string | null;
  updateClient: (clientId: string, name: string) => Promise<boolean>;
  deletingClientId: string | null;
  deleteError: string | null;
  deleteClient: (clientId: string) => Promise<boolean>;
};

const ERROR_CODE_TO_I18N_KEY: Record<string, string> = {
  CLIENT_NAME_EXISTS: "clients.errors.clientNameExists",
  CLIENT_NOT_FOUND: "clients.errors.clientNotFound",
  CLIENT_DELETE_BLOCKED: "clients.errors.clientDeleteBlocked",
  VALIDATION_ERROR: "clients.errors.validation",
  FORBIDDEN: "auth.errors.forbiddenMutation",
  UNAUTHORIZED: "auth.errors.unauthorized",
};

const pageSizeOptions = [10, 20, 50];

const defaultPagination: PaginationMeta = {
  page: 1,
  pageSize: pageSizeOptions[0],
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export function useClients(orgId: string): UseClientsResult {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(pageSizeOptions[0]);
  const [sortBy, setSortBy] = useState<ClientSortBy>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const repository = useMemo(() => new BackendClientRepository(), []);
  const getClientsUseCase = useMemo(() => new GetClientsUseCase(repository), [repository]);
  const createClientUseCase = useMemo(() => new CreateClientUseCase(repository), [repository]);
  const updateClientUseCase = useMemo(() => new UpdateClientUseCase(repository), [repository]);
  const deleteClientUseCase = useMemo(() => new DeleteClientUseCase(repository), [repository]);

  const setSearchWithReset = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: ClientSortBy) => {
      setPage(1);

      if (sortBy === field) {
        setSortDir((currentSortDir) => (currentSortDir === "asc" ? "desc" : "asc"));
        return;
      }

      setSortBy(field);
      setSortDir("asc");
    },
    [sortBy]
  );

  const clientsQuery = useQuery({
    queryKey: clientsQueryKeys.list(orgId, debouncedSearch, page, pageSize, sortBy, sortDir),
    queryFn: () => getClientsUseCase.execute(orgId, { search: debouncedSearch, page, pageSize, sortBy, sortDir }),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createClientUseCase.execute(orgId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all(orgId) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ clientId, name }: { clientId: string; name: string }) =>
      updateClientUseCase.execute(orgId, clientId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all(orgId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (clientId: string) => deleteClientUseCase.execute(orgId, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all(orgId) });
    },
  });

  async function createClient(name: string) {
    try {
      setCreateError(null);
      await createMutation.mutateAsync(name);
      return true;
    } catch (error) {
      setCreateError(resolveClientErrorMessage(error, t("clients.errors.create"), t));
      return false;
    }
  }

  async function updateClient(clientId: string, name: string) {
    try {
      setEditError(null);
      await updateMutation.mutateAsync({ clientId, name });
      return true;
    } catch (error) {
      setEditError(resolveClientErrorMessage(error, t("clients.errors.update"), t));
      return false;
    }
  }

  async function deleteClient(clientId: string) {
    try {
      setDeletingClientId(clientId);
      setDeleteError(null);
      await deleteMutation.mutateAsync(clientId);
      return true;
    } catch (error) {
      setDeleteError(resolveClientErrorMessage(error, t("clients.errors.delete"), t));
      return false;
    } finally {
      setDeletingClientId(null);
    }
  }

  return {
    search,
    setSearch: setSearchWithReset,
    sortBy,
    sortDir,
    toggleSort,
    pagination: clientsQuery.data?.pagination ?? { ...defaultPagination, page, pageSize },
    pageSizeOptions,
    setPage,
    setPageSize,
    clients: clientsQuery.data?.data ?? [],
    loading: clientsQuery.isPending,
    error: clientsQuery.error ? resolveClientErrorMessage(clientsQuery.error, t("clients.errors.load"), t) : null,
    creating: createMutation.isPending,
    createError,
    createClient,
    editing: updateMutation.isPending,
    editError,
    updateClient,
    deletingClientId,
    deleteError,
    deleteClient,
  };
}

function resolveClientErrorMessage(
  error: unknown,
  fallbackMessage: string,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  if (error instanceof ApiError) {
    if (error.code) {
      const i18nKey = ERROR_CODE_TO_I18N_KEY[error.code];
      if (i18nKey) {
        const params = buildErrorParams(error.details, t);
        return t(i18nKey, params);
      }
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

function buildErrorParams(
  details: Record<string, unknown> | null,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  const fieldRaw = typeof details?.field === "string" ? details.field : null;
  const reasonRaw = typeof details?.reason === "string" ? details.reason : null;

  const field = fieldRaw ? t(`clients.fields.${fieldRaw}`) : t("clients.fields.unknown");
  const reason = reasonRaw ? t(`clients.reasons.${reasonRaw}`) : t("clients.reasons.unknown");

  return { field, reason };
}
