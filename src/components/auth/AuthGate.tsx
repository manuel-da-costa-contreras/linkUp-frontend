"use client";

import { ReactNode, useState } from "react";
import { Loader } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";
import { useAuth } from "@/lib/auth";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { t } = useI18n();
  const { status, authEnabled, authError, signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSignIn() {
    try {
      setSubmitting(true);
      setSubmitError(null);
      await signIn();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("auth.errors.signIn"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!authEnabled) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-content-center">
        <Loader centered label={t("auth.loading")} />
      </div>
    );
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return (
    <div className="grid min-h-screen place-content-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-zinc-900">{t("auth.signIn.title")}</h1>
        <p className="mt-2 text-sm text-zinc-600">{t("auth.signIn.description")}</p>

        {authError || submitError ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError ?? authError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void handleSignIn()}
          disabled={submitting}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? t("auth.signIn.submitting") : t("auth.signIn.action")}
        </button>
      </div>
    </div>
  );
}
