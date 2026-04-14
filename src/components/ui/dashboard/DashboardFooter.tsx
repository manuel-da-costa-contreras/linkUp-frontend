"use client";

import { useI18n } from "@/i18n/I18nProvider";

const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com";
const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com";

export function DashboardFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-zinc-200 bg-[#f5f8ff] px-4 py-4">
      <div className="flex w-full items-center justify-center gap-3">
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-cyan-700 underline-offset-4 transition-colors hover:text-cyan-800 hover:underline"
        >
          {t("navigation.footer.linkedin")}
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-cyan-700 underline-offset-4 transition-colors hover:text-cyan-800 hover:underline"
        >
          {t("navigation.footer.github")}
        </a>
      </div>
    </footer>
  );
}
