"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useI18n } from "@i18n/I18nProvider";
import { ApiError } from "@lib/api/httpClient";
import type { PaginationMeta } from "@shared/pagination/types";
import { useDebounce } from "@utils/useDebounce";
import { CreateJobUseCase } from "@features/jobs/application/use-cases/CreateJobUseCase";
import { DeleteJobUseCase } from "@features/jobs/application/use-cases/DeleteJobUseCase";
import { GetJobClientOptionsUseCase } from "@features/jobs/application/use-cases/GetJobClientOptionsUseCase";
import { GetJobsUseCase } from "@features/jobs/application/use-cases/GetJobsUseCase";
import { jobsQueryKeys } from "@features/jobs/application/use-cases/queryKeys";
import { UpdateJobStatusUseCase } from "@features/jobs/application/use-cases/UpdateJobStatusUseCase";
import type { Job, JobClientOption, JobStatus } from "@features/jobs/domain/entities/Job";
import type { JobSortBy, SortDir } from "@features/jobs/domain/repositories/JobRepository";
import { BackendJobRepository } from "@features/jobs/infrastructure/repositories/BackendJobRepository";

type UpdateJobStatusInput = {
  status: JobStatus;
  reason?: string;
  rating?: number;
};

type UseJobsResult = {
  search: string;
  setSearch: (value: string) => void;
  jobs: Job[];
  clientOptions: JobClientOption[];
  sortBy: JobSortBy;
  sortDir: SortDir;
  toggleSort: (field: JobSortBy) => void;
  pagination: PaginationMeta;
  pageSizeOptions: number[];
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  loading: boolean;
  error: string | null;
  creating: boolean;
  createError: string | null;
  createJob: (name: string, clientId: string) => Promise<boolean>;
  deletingJobId: string | null;
  deleteError: string | null;
  deleteJob: (jobId: string) => Promise<boolean>;
  statusUpdateJobId: string | null;
  statusUpdateError: string | null;
  statusUpdateSuccess: string | null;
  clearStatusUpdateFeedback: () => void;
  transitionJobStatus: (jobId: string, input: UpdateJobStatusInput) => Promise<boolean>;
};

const ERROR_CODE_TO_I18N_KEY: Record<string, string> = {
  JOB_NOT_FOUND: "jobs.errors.jobNotFound",
  INVALID_STATUS_TRANSITION: "jobs.errors.invalidStatusTransition",
  JOB_DELETE_BLOCKED: "jobs.errors.deleteBlocked",
  RATING_REQUIRED: "jobs.errors.ratingRequired",
  RATING_OUT_OF_RANGE: "jobs.errors.ratingOutOfRange",
  REASON_TOO_LONG: "jobs.errors.reasonTooLong",
  VALIDATION_ERROR: "jobs.errors.validation",
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

export function useJobs(orgId: string): UseJobsResult {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(pageSizeOptions[0]);
  const [sortBy, setSortBy] = useState<JobSortBy>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(null);
  const [statusUpdateJobId, setStatusUpdateJobId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const repository = useMemo(() => new BackendJobRepository(), []);
  const getJobsUseCase = useMemo(() => new GetJobsUseCase(repository), [repository]);
  const getClientOptionsUseCase = useMemo(() => new GetJobClientOptionsUseCase(repository), [repository]);
  const createJobUseCase = useMemo(() => new CreateJobUseCase(repository), [repository]);
  const deleteJobUseCase = useMemo(() => new DeleteJobUseCase(repository), [repository]);
  const updateJobStatusUseCase = useMemo(() => new UpdateJobStatusUseCase(repository), [repository]);

  const setSearchWithReset = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const jobsQuery = useQuery({
    queryKey: jobsQueryKeys.list(orgId, debouncedSearch, page, pageSize, sortBy, sortDir),
    queryFn: () => getJobsUseCase.execute(orgId, { search: debouncedSearch, page, pageSize, sortBy, sortDir }),
  });

  const clientOptionsQuery = useQuery({
    queryKey: jobsQueryKeys.clientOptions(orgId),
    queryFn: () => getClientOptionsUseCase.execute(orgId),
  });

  const createMutation = useMutation({
    mutationFn: ({ name, clientId }: { name: string; clientId: string }) =>
      createJobUseCase.execute(orgId, name, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKeys.all(orgId) });
      queryClient.invalidateQueries({ queryKey: ["clients", orgId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", orgId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", orgId] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: UpdateJobStatusInput }) =>
      updateJobStatusUseCase.execute(orgId, jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKeys.all(orgId) });
      queryClient.invalidateQueries({ queryKey: ["clients", orgId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", orgId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", orgId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => deleteJobUseCase.execute(orgId, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKeys.all(orgId) });
      queryClient.invalidateQueries({ queryKey: ["clients", orgId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", orgId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", orgId] });
    },
  });

  const clearStatusUpdateFeedback = useCallback(() => {
    setStatusUpdateError(null);
    setStatusUpdateSuccess(null);
  }, []);

  const setPageSize = useCallback((nextPageSize: number) => {
    setPage(1);
    setPageSizeState(nextPageSize);
  }, []);

  const toggleSort = useCallback(
    (field: JobSortBy) => {
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

  async function createJob(name: string, clientId: string) {
    try {
      setCreateError(null);
      await createMutation.mutateAsync({ name, clientId });
      return true;
    } catch (error) {
      setCreateError(resolveJobsErrorMessage(error, t("jobs.errors.create"), t));
      return false;
    }
  }

  async function transitionJobStatus(jobId: string, input: UpdateJobStatusInput) {
    if (!jobId.trim()) {
      setStatusUpdateError(t("jobs.errors.jobNotFound", { field: t("jobs.fields.jobId") }));
      return false;
    }

    try {
      setStatusUpdateJobId(jobId);
      clearStatusUpdateFeedback();
      await statusMutation.mutateAsync({ jobId, payload: input });

      if (input.status === "IN_PROGRESS") {
        setStatusUpdateSuccess(t("jobs.feedback.started"));
      } else if (input.status === "PENDING") {
        setStatusUpdateSuccess(t("jobs.feedback.returnedToPending"));
      } else if (input.status === "COMPLETED") {
        setStatusUpdateSuccess(t("jobs.feedback.completed"));
      } else {
        setStatusUpdateSuccess(t("jobs.feedback.rejected"));
      }

      return true;
    } catch (error) {
      setStatusUpdateError(resolveJobsErrorMessage(error, t("jobs.errors.updateStatus"), t));
      return false;
    } finally {
      setStatusUpdateJobId(null);
    }
  }

  async function deleteJob(jobId: string) {
    if (!jobId.trim()) {
      setDeleteError(t("jobs.errors.jobNotFound", { field: t("jobs.fields.jobId") }));
      return false;
    }

    try {
      setDeleteError(null);
      setDeletingJobId(jobId);
      await deleteMutation.mutateAsync(jobId);
      return true;
    } catch (error) {
      setDeleteError(resolveJobsErrorMessage(error, t("jobs.errors.delete"), t));
      return false;
    } finally {
      setDeletingJobId(null);
    }
  }

  const queryError = jobsQuery.error ?? clientOptionsQuery.error;

  return {
    search,
    setSearch: setSearchWithReset,
    jobs: jobsQuery.data?.data ?? [],
    clientOptions: clientOptionsQuery.data ?? [],
    sortBy,
    sortDir,
    toggleSort,
    pagination: jobsQuery.data?.pagination ?? { ...defaultPagination, page, pageSize },
    pageSizeOptions,
    setPage,
    setPageSize,
    loading: jobsQuery.isPending || clientOptionsQuery.isPending,
    error: queryError ? resolveJobsErrorMessage(queryError, t("jobs.errors.load"), t) : null,
    creating: createMutation.isPending,
    createError,
    createJob,
    deletingJobId,
    deleteError,
    deleteJob,
    statusUpdateJobId,
    statusUpdateError,
    statusUpdateSuccess,
    clearStatusUpdateFeedback,
    transitionJobStatus,
  };
}

function resolveJobsErrorMessage(
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
  const statusRaw = typeof details?.status === "string" ? details.status : null;

  const field = fieldRaw ? t(`jobs.fields.${fieldRaw}`) : t("jobs.fields.unknown");
  const reason = reasonRaw ? t(`jobs.reasons.${reasonRaw}`) : t("jobs.reasons.unknown");
  const status = statusRaw ? t(`jobs.statusMap.${statusRaw}`) : t("jobs.statusMap.unknown");

  return { field, reason, status };
}



