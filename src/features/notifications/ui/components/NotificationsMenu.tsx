"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";
import { useNotifications } from "../hooks/useNotifications";

type NotificationsMenuProps = {
  orgId: string;
};

export function NotificationsMenu({ orgId }: NotificationsMenuProps) {
  const { t } = useI18n();
  const {
    notifications,
    loading,
    dismissingOne,
    dismissingAll,
    error,
    actionError,
    dismissNotification,
    dismissAllNotifications,
  } = useNotifications(orgId);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const visibleCount = notifications.length;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      const target = event.target as Node;
      if (!containerRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative grid h-10 w-10 place-content-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
        aria-label={t("navigation.topbar.alerts")}
      >
        {visibleCount > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" /> : null}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.27 21a2 2 0 0 0 3.46 0" />
          <path d="M4 16h16" />
          <path d="M6.3 16a4 4 0 0 1-.3-1.5V11a6 6 0 1 1 12 0v3.5a4 4 0 0 1-.3 1.5" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">{t("navigation.topbar.notificationsTitle")}</p>
            <div className="flex items-center gap-2">
              {visibleCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void dismissAllNotifications()}
                  disabled={dismissingAll || dismissingOne}
                  className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700"
                >
                  {t("navigation.topbar.clearAll")}
                </button>
              ) : null}
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">{visibleCount}</span>
            </div>
          </div>

          {error || actionError ? (
            <p className="mb-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700">
              {actionError ?? error}
            </p>
          ) : null}

          {loading ? (
            <Loader centered label="" size="sm" />
          ) : notifications.length === 0 ? (
            <p className="py-3 text-sm text-zinc-500">{t("navigation.topbar.notificationsEmpty")}</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {notifications.map((item) => (
                <li key={item.id} className="rounded-lg border border-zinc-100 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
                      {item.status === "PENDING"
                        ? t("navigation.topbar.notificationPending")
                        : t("navigation.topbar.notificationRejected")}
                    </p>
                    <button
                      type="button"
                      onClick={() => void dismissNotification(item.id)}
                      disabled={dismissingOne || dismissingAll}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                      aria-label={t("navigation.topbar.dismissOne")}
                    >
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
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-medium text-zinc-800">{item.jobName}</p>
                  <p className="text-xs text-zinc-500">{item.clientName}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 border-t border-zinc-100 pt-2">
            <Link href="/jobs" onClick={() => setOpen(false)} className="text-xs font-medium text-cyan-700 hover:underline">
              {t("navigation.topbar.viewAllJobs")}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
