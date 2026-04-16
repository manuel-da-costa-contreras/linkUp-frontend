"use client";

import { LanguageSelector } from "@components/ui";
import { NotificationsMenu } from "@features/notifications";
import { useI18n } from "@i18n/I18nProvider";
import { useAuth } from "@lib/auth";
import { AppLogo } from "@components/ui/dashboard/AppLogo";
import { UserMenu } from "@components/ui/dashboard/UserMenu";

type TopBarProps = {
  onToggleSidebar: () => void;
};

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const { t, locale, locales, setLocale } = useI18n();
  const { user, signOut } = useAuth();
  const activeOrgId = user?.orgId ?? (process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ?? "acme");
  const userName = user?.name ?? "LinkUP User";
  const roleKey = user?.role ? `userMenu.role.${user.role}` : "userMenu.role.UNKNOWN";
  const userRole = t(roleKey);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="grid h-10 w-10 place-content-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 lg:hidden"
            aria-label={t("navigation.sidebar.openMenu")}
          >
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
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
          </button>
          <AppLogo />
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector
            value={locale}
            options={locales}
            label={t("common.language.label")}
            onChange={setLocale}
          />

          <NotificationsMenu orgId={activeOrgId} />
          <UserMenu userName={userName} role={userRole} onLogout={signOut} />
        </div>
      </div>
    </header>
  );
}



