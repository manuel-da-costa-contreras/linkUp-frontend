"use client";

import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { NotificationsMenu } from "@/features/notifications";
import { useI18n } from "@/i18n/I18nProvider";
import { useAuth } from "@/lib/auth";
import { AppLogo } from "./AppLogo";
import { UserMenu } from "./UserMenu";

type TopBarProps = {
  onToggleSidebar: () => void;
};

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const { t, locale, locales, setLocale } = useI18n();
  const { user, signOut } = useAuth();
  const activeOrgId = user?.orgId ?? (process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ?? "acme");
  const userName = user?.name ?? "LinkUP User";

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="grid h-10 w-10 place-content-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 lg:hidden"
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
          <UserMenu userName={userName} onLogout={signOut} />
        </div>
      </div>
    </header>
  );
}
