"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/utils/cn";

type UserMenuProps = {
  userName: string;
  onLogout?: () => Promise<void> | void;
};

export function UserMenu({ userName, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  async function handleLogout() {
    if (!onLogout) {
      return;
    }

    try {
      setSubmitting(true);
      await onLogout();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-left hover:border-zinc-300"
      >
        <div className="grid h-8 w-8 place-content-center rounded-lg bg-zinc-900 text-xs font-semibold text-white">
          {userName
            .split(" ")
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("")}
        </div>
        <span className="hidden text-sm font-medium text-zinc-700 sm:block">{userName}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={cn("h-4 w-4 text-zinc-500 transition-transform", open && "rotate-180")}
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.12l3.71-3.9a.75.75 0 1 1 1.08 1.04l-4.25 4.47a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
          <p className="px-3 py-2 text-xs uppercase tracking-[0.12em] text-zinc-500">
            {t("userMenu.title.account")}
          </p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={submitting}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            {submitting ? t("userMenu.action.loggingOut") : t("userMenu.action.logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
