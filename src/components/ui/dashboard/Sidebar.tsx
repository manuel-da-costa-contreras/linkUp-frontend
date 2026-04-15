"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/utils/cn";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const items = [
    { href: "/", label: t("navigation.sidebar.dashboard"), icon: DashboardIcon },
    { href: "/clients", label: t("navigation.sidebar.clients"), icon: ClientsIcon },
    { href: "/jobs", label: t("navigation.sidebar.jobs"), icon: JobsIcon },
  ];

  function isActiveRoute(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-16 left-0 z-20 w-72 border-r border-neutral-200 bg-white p-4 transition-transform lg:static lg:inset-auto lg:translate-x-0 lg:shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
          {t("navigation.sidebar.title")}
        </p>
        <nav className="mt-3 space-y-1">
          {items.map((item) => {
            const active = isActiveRoute(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200",
                  active
                    ? "bg-primary-100 font-semibold text-primary-800"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
                )}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label={t("navigation.sidebar.closeMenu")}
          onClick={onClose}
          className="fixed inset-0 top-16 z-10 bg-neutral-900/40 lg:hidden"
        />
      ) : null}
    </>
  );
}

function DashboardIcon() {
  return (
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
      <path d="M3 13h8V3H3zM13 21h8v-8h-8zM13 3v6h8V3zM3 21h8v-6H3z" />
    </svg>
  );
}

function ClientsIcon() {
  return (
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function JobsIcon() {
  return (
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
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
