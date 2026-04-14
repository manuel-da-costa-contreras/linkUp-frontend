"use client";

import { cn } from "@/utils/cn";

type SortDir = "asc" | "desc";

type TableSortHeaderProps = {
  label: string;
  active: boolean;
  direction: SortDir;
  onToggle: () => void;
  className?: string;
};

export function TableSortHeader({ label, active, direction, onToggle, className }: TableSortHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1 text-left text-sm font-medium transition-colors hover:text-zinc-700",
        active ? "text-zinc-700" : "text-zinc-500",
        className
      )}
      aria-label={`${label} (${direction})`}
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded-sm",
          active ? "text-cyan-600" : "text-zinc-400"
        )}
      >
        {active ? (
          direction === "asc" ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m8 9 4-4 4 4" />
            <path d="m16 15-4 4-4-4" />
          </svg>
        )}
      </span>
    </button>
  );
}

