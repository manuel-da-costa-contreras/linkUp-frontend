"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Card, Loader, Modal, SectionHeading, TablePagination, TableSortHeader, Tooltip, useToast } from "@components/ui";
import { useI18n } from "@i18n/I18nProvider";
import { useAuth } from "@lib/auth";
import type { Job, JobStatus } from "@features/jobs/domain/entities/Job";
import type { JobSortBy } from "@features/jobs/domain/repositories/JobRepository";
import { useJobs } from "@features/jobs/ui/hooks/useJobs";
import { JobStatusTransitionModal } from "@features/jobs/ui/components/JobStatusTransitionModal";

type JobsTableProps = {
  orgId: string;
};

export function JobsTable({ orgId }: JobsTableProps) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { canCreateJobs, canUpdateJobStatus } = useAuth();
  const {
    search,
    setSearch,
    jobs,
    clientOptions,
    sortBy,
    sortDir,
    toggleSort,
    pagination,
    pageSizeOptions,
    setPage,
    setPageSize,
    loading,
    error,
    creating,
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
  } = useJobs(orgId);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [transitionModalJobId, setTransitionModalJobId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetJob, setDeleteTargetJob] = useState<Job | null>(null);
  const [jobName, setJobName] = useState("");
  const [clientId, setClientId] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const canCreate = useMemo(() => {
    return jobName.trim().length >= 2 && clientId.trim().length > 0 && !creating;
  }, [clientId, creating, jobName]);

  useEffect(() => {
    if (statusUpdateSuccess) {
      showToast({ message: statusUpdateSuccess, variant: "success" });
      clearStatusUpdateFeedback();
    }
  }, [clearStatusUpdateFeedback, showToast, statusUpdateSuccess]);

  useEffect(() => {
    if (statusUpdateError) {
      showToast({ message: statusUpdateError, variant: "error" });
      clearStatusUpdateFeedback();
    }
  }, [clearStatusUpdateFeedback, showToast, statusUpdateError]);

  function openCreateModal() {
    setCreateModalOpen(true);
    setJobName("");
    setClientId("");
    setNameError(null);
    setClientError(null);
  }

  function closeCreateModal() {
    if (creating) {
      return;
    }

    setCreateModalOpen(false);
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();

    const normalizedName = jobName.trim();
    if (normalizedName.length < 2) {
      setNameError(t("jobs.modal.validation.nameMin"));
      return;
    }

    if (!clientId) {
      setClientError(t("jobs.modal.validation.clientRequired"));
      return;
    }

    const ok = await createJob(normalizedName, clientId);
    if (ok) {
      closeCreateModal();
    }
  }

  function openDeleteModal(job: Job) {
    setDeleteTargetJob(job);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (deleteTargetJob && deletingJobId === deleteTargetJob.id) {
      return;
    }

    setDeleteModalOpen(false);
    setDeleteTargetJob(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTargetJob) {
      return;
    }

    const ok = await deleteJob(deleteTargetJob.id);
    if (ok) {
      closeDeleteModal();
    }
  }

  function renderSortHeader(label: string, field: JobSortBy) {
    return (
      <TableSortHeader
        label={label}
        active={sortBy === field}
        direction={sortBy === field ? sortDir : "asc"}
        onToggle={() => toggleSort(field)}
      />
    );
  }

  const transitionTarget = jobs.find((job) => job.id === transitionModalJobId) ?? null;

  return (
    <div className="space-y-6">
      <SectionHeading title={t("jobs.heading.title")} description={t("jobs.heading.description")} />

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <input
              id="job-search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("jobs.search.placeholder")}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
            />
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            disabled={!canCreateJobs}
            title={!canCreateJobs ? t("auth.errors.forbiddenMutation") : undefined}
            className="h-10 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
          >
            {t("jobs.actions.add")}
          </button>
        </div>

        {loading ? (
          <Loader centered label="" />
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : (
          <>
            <div className="relative overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="py-3 pr-3 font-medium">{renderSortHeader(t("jobs.table.column.name"), "name")}</th>
                    <th className="py-3 px-3 font-medium">
                      {renderSortHeader(t("jobs.table.column.assignedTo"), "clientName")}
                    </th>
                    <th className="py-3 px-3 font-medium">{renderSortHeader(t("jobs.table.column.status"), "status")}</th>
                    <th className="w-24 py-3 pl-3 text-right font-medium">
                      <span className="sr-only">{t("jobs.table.column.actions")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => (
                    <tr key={job.id || `job-row-${index}`} className="border-b border-neutral-100 text-neutral-700 last:border-b-0">
                      <td className="py-3 pr-3 font-medium text-neutral-900">{job.name}</td>
                      <td className="py-3 px-3">{job.clientName}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {job.status === "PENDING" || job.status === "IN_PROGRESS" ? (
                            <Tooltip content={t("jobs.tooltip.changeStatus")} side="left">
                              <button
                                type="button"
                                disabled={statusUpdateJobId === job.id || !canUpdateJobStatus || !job.id}
                                onClick={() => {
                                  clearStatusUpdateFeedback();
                                  setTransitionModalJobId(job.id);
                                }}
                                data-testid="job-row-change-status"
                                title={
                                  !canUpdateJobStatus ? t("auth.errors.forbiddenMutation") : t("jobs.tooltip.changeStatus")
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
                                aria-label={t("jobs.actions.changeStatus")}
                              >
                                {job.status === "PENDING" ? (
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="currentColor"
                                  >
                                    <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.6-6.86a1 1 0 0 0 0-1.68L9.53 4.29A1 1 0 0 0 8 5.14Z" />
                                  </svg>
                                ) : (
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 12a9 9 0 0 1 15.55-6.36" />
                                    <path d="M21 3v6h-6" />
                                    <path d="M21 12a9 9 0 0 1-15.55 6.36" />
                                    <path d="M3 21v-6h6" />
                                  </svg>
                                )}
                              </button>
                            </Tooltip>
                          ) : null}

                          {job.status !== "IN_PROGRESS" ? (
                            <Tooltip content={t("jobs.tooltip.delete")} side="left">
                              <button
                                type="button"
                                onClick={() => openDeleteModal(job)}
                                data-testid="job-row-delete"
                                disabled={deletingJobId === job.id || !canUpdateJobStatus || !job.id}
                                title={!canUpdateJobStatus ? t("auth.errors.forbiddenMutation") : t("jobs.tooltip.delete")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                                aria-label={t("jobs.tooltip.delete")}
                              >
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                                  <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                </svg>
                              </button>
                            </Tooltip>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {jobs.length === 0 ? <p className="py-4 text-sm text-neutral-500">{t("jobs.table.empty")}</p> : null}
              {deleteError ? <p className="pt-2 text-xs text-red-700">{deleteError}</p> : null}

              {deletingJobId ? (
                <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/70 backdrop-blur-[2px]">
                  <Loader centered label={t("jobs.modal.status.deleting")} />
                </div>
              ) : null}
            </div>

            <TablePagination
              pagination={pagination}
              pageSizeOptions={pageSizeOptions}
              disabled={loading}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </Card>

      <Modal
        open={createModalOpen}
        title={t("jobs.modal.create.title")}
        onClose={closeCreateModal}
        footer={
          <>
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="submit"
              form="create-job-form"
              disabled={!canCreate || !canCreateJobs}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? t("jobs.modal.status.creating") : t("common.actions.accept")}
            </button>
          </>
        }
      >
        <form id="create-job-form" onSubmit={handleCreate} className="space-y-3">
          <label className="block text-sm font-medium text-neutral-700" htmlFor="job-name-input">
            {t("jobs.modal.field.name")}
          </label>
          <input
            id="job-name-input"
            value={jobName}
            onChange={(event) => {
              setJobName(event.target.value);
              if (nameError) {
                setNameError(null);
              }
            }}
            placeholder={t("jobs.modal.field.namePlaceholder")}
            className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
          />
          {nameError ? <p className="text-xs text-red-700">{nameError}</p> : null}

          <label className="block text-sm font-medium text-neutral-700" htmlFor="job-client-select">
            {t("jobs.modal.field.client")}
          </label>
          <select
            id="job-client-select"
            value={clientId}
            onChange={(event) => {
              setClientId(event.target.value);
              if (clientError) {
                setClientError(null);
              }
            }}
            className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
          >
            <option value="">{t("jobs.modal.field.clientPlaceholder")}</option>
            {clientOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {clientError ? <p className="text-xs text-red-700">{clientError}</p> : null}

          <p className="text-xs text-neutral-500">{t("jobs.modal.defaultStatus")}</p>
          {createError ? <p className="text-xs text-red-700">{createError}</p> : null}
        </form>
      </Modal>

      <JobStatusTransitionModal
        key={transitionTarget ? `${transitionTarget.id}-${transitionTarget.status}` : "job-transition-modal"}
        open={Boolean(transitionTarget && (transitionTarget.status === "PENDING" || transitionTarget.status === "IN_PROGRESS"))}
        loading={statusUpdateJobId === transitionTarget?.id}
        currentStatus={
          transitionTarget && (transitionTarget.status === "PENDING" || transitionTarget.status === "IN_PROGRESS")
            ? transitionTarget.status
            : null
        }
        onClose={() => setTransitionModalJobId(null)}
        onSubmit={async (payload) => {
          if (!transitionTarget) {
            return false;
          }

          if (!canUpdateJobStatus) {
            showToast({ message: t("auth.errors.forbiddenMutation"), variant: "error" });
            return false;
          }

          return transitionJobStatus(transitionTarget.id, payload);
        }}
      />

      <Modal
        open={deleteModalOpen}
        title={t("jobs.modal.delete.title")}
        onClose={closeDeleteModal}
        testId="job-delete-modal"
        footer={
          <>
            <button
              type="button"
              onClick={closeDeleteModal}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmDelete()}
              data-testid="job-delete-confirm"
              disabled={!deleteTargetJob || deletingJobId === deleteTargetJob?.id}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteTargetJob && deletingJobId === deleteTargetJob.id
                ? t("jobs.modal.status.deleting")
                : t("common.actions.delete")}
            </button>
          </>
        }
      >
        {deleteTargetJob ? (
          <p className="text-sm text-neutral-700">{t("jobs.modal.delete.description", { name: deleteTargetJob.name })}</p>
        ) : null}
      </Modal>
    </div>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const { t } = useI18n();

  const styleMap: Record<JobStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-primary-100 text-primary-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
  };

  const labelMap: Record<JobStatus, string> = {
    PENDING: t("jobs.status.pending"),
    IN_PROGRESS: t("jobs.status.inProgress"),
    COMPLETED: t("jobs.status.completed"),
    REJECTED: t("jobs.status.rejected"),
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styleMap[status]}`}>{labelMap[status]}</span>;
}





