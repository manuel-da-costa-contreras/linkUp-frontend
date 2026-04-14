"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { PaginationMeta } from "@/shared/pagination/types";

type TablePaginationProps = {
  pagination: PaginationMeta;
  pageSizeOptions?: number[];
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

type PaginationItem = number | "dots";

const defaultPageSizeOptions = [10, 20, 50];

export function TablePagination({
  pagination,
  pageSizeOptions = defaultPageSizeOptions,
  disabled = false,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const { t } = useI18n();

  const totalPages = Math.max(pagination.totalPages, 1);
  const pageItems = buildPageItems(pagination.page, totalPages);

  return (
    <div className="mt-4 border-t border-zinc-200 pt-3">
      <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="hidden md:block" />

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={disabled || !pagination.hasPrevPage}
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("common.pagination.previous")}
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
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {pageItems.map((item, index) => {
            if (item === "dots") {
              return (
                <span key={`dots-${index}`} className="px-1 text-sm font-semibold text-zinc-400">
                  ...
                </span>
              );
            }

            const active = item === pagination.page;

            return (
              <button
                key={item}
                type="button"
                disabled={disabled || active}
                onClick={() => onPageChange(item)}
                className={
                  active
                    ? "inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-cyan-600 px-2 text-sm font-semibold text-white"
                    : "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                {item}
              </button>
            );
          })}

          <button
            type="button"
            disabled={disabled || !pagination.hasNextPage}
            onClick={() => onPageChange(Math.min(totalPages, pagination.page + 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("common.pagination.next")}
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
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <label htmlFor="table-page-size" className="text-xs text-zinc-500">
            {t("common.pagination.pageSize")}
          </label>
          <select
            id="table-page-size"
            value={pagination.pageSize}
            disabled={disabled}
            onChange={(event) => onPageSizeChange(Number.parseInt(event.target.value, 10))}
            className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-700 outline-none transition-colors focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function buildPageItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "dots", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "dots", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "dots", currentPage - 1, currentPage, currentPage + 1, "dots", totalPages];
}
