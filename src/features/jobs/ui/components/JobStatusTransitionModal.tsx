"use client";

import { FormEvent, useMemo, useState } from "react";
import { Modal, RatingStars } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";

type TransitionSourceStatus = "PENDING" | "IN_PROGRESS";

type TransitionTargetStatus = "IN_PROGRESS" | "PENDING" | "COMPLETED" | "REJECTED";

type JobStatusTransitionModalProps = {
  open: boolean;
  loading: boolean;
  currentStatus: TransitionSourceStatus | null;
  onClose: () => void;
  onSubmit: (payload: { status: TransitionTargetStatus; reason?: string; rating?: number }) => Promise<boolean>;
};

export function JobStatusTransitionModal({
  open,
  loading,
  currentStatus,
  onClose,
  onSubmit,
}: JobStatusTransitionModalProps) {
  const { t } = useI18n();
  const [nextStatus, setNextStatus] = useState<TransitionTargetStatus>(() =>
    currentStatus === "IN_PROGRESS" ? "PENDING" : "IN_PROGRESS"
  );
  const [reason, setReason] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const options = useMemo<TransitionTargetStatus[]>(() => {
    if (currentStatus === "PENDING") {
      return ["IN_PROGRESS", "REJECTED"];
    }

    return ["PENDING", "COMPLETED", "REJECTED"];
  }, [currentStatus]);

  const submitLabel = useMemo(() => {
    if (loading) {
      return t("jobs.modal.transition.status.saving");
    }

    return t("common.actions.save");
  }, [loading, t]);

  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload: { status: TransitionTargetStatus; reason?: string; rating?: number } = {
      status: nextStatus,
    };

    const normalizedReason = reason.trim();
    if (normalizedReason && nextStatus !== "IN_PROGRESS") {
      payload.reason = normalizedReason;
    }

    if (nextStatus === "COMPLETED") {
      if (rating < 1 || rating > 5) {
        setRatingError(t("jobs.modal.transition.validation.ratingRange"));
        return;
      }

      payload.rating = rating;
    }

    const ok = await onSubmit(payload);
    if (ok) {
      handleClose();
    }
  }

  const reasonLabel =
    nextStatus === "PENDING"
      ? t("jobs.modal.transition.field.reasonPending")
      : t("jobs.modal.transition.field.reason");

  return (
    <Modal
      open={open}
      title={t("jobs.modal.transition.title")}
      onClose={handleClose}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            {t("common.actions.cancel")}
          </button>
          <button
            type="submit"
            form="job-status-transition-form"
            disabled={loading}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </>
      }
    >
      <form id="job-status-transition-form" onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-zinc-700" htmlFor="job-next-status-select">
          {t("jobs.modal.transition.field.nextStatus")}
        </label>
        <select
          id="job-next-status-select"
          value={nextStatus}
          onChange={(event) => {
            const status = event.target.value as TransitionTargetStatus;
            setNextStatus(status);
            if (status !== "COMPLETED") {
              setRatingError(null);
            }
          }}
          className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-cyan-500"
        >
          {options.map((status) => (
            <option key={status} value={status}>
              {status === "IN_PROGRESS"
                ? t("jobs.modal.transition.option.inProgress")
                : status === "PENDING"
                  ? t("jobs.modal.transition.option.pending")
                  : status === "COMPLETED"
                    ? t("jobs.modal.transition.option.completed")
                    : t("jobs.modal.transition.option.rejected")}
            </option>
          ))}
        </select>

        {nextStatus !== "IN_PROGRESS" ? (
          <>
            <label className="block text-sm font-medium text-zinc-700" htmlFor="job-transition-reason">
              {reasonLabel}
            </label>
            <textarea
              id="job-transition-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder={
                nextStatus === "COMPLETED"
                  ? t("jobs.modal.transition.field.reasonPlaceholderCompleted")
                  : t("jobs.modal.transition.field.reasonPlaceholder")
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none transition-colors focus:border-cyan-500"
            />
          </>
        ) : null}

        {nextStatus === "COMPLETED" ? (
          <>
            <RatingStars
              value={rating}
              onChange={(value) => {
                setRating(value);
                if (ratingError) {
                  setRatingError(null);
                }
              }}
              label={t("jobs.modal.transition.field.rating")}
            />
            {ratingError ? <p className="text-xs text-red-700">{ratingError}</p> : null}
            <p className="text-xs text-zinc-500">{t("jobs.modal.transition.helper")}</p>
          </>
        ) : null}
      </form>
    </Modal>
  );
}
