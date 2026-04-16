"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Loader } from "@components/ui";
import { useI18n } from "@i18n/I18nProvider";
import { useAuth } from "@lib/auth";
import { AuthRegistrationError } from "@lib/auth/firebase";

type AuthGateProps = {
  children: ReactNode;
};

type AuthMode = "sign-in" | "sign-up";

export function AuthGate({ children }: AuthGateProps) {
  const { t } = useI18n();
  const { status, authEnabled, authError, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } =
    useAuth();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const canSubmit = useMemo(() => {
    const hasEmail = email.trim().length >= 5;
    const hasPassword = password.length >= 6;

    if (mode === "sign-up") {
      return name.trim().length >= 2 && hasEmail && hasPassword && password === confirmPassword;
    }

    return hasEmail && hasPassword;
  }, [confirmPassword, email, mode, name, password]);

  function normalizeError(error: unknown) {
    if (error instanceof AuthRegistrationError) {
      if (error.code === "EMAIL_ALREADY_EXISTS") {
        return t("auth.errors.emailInUse");
      }

      if (error.code === "VALIDATION_ERROR") {
        return t("auth.errors.validation");
      }

      if (error.code === "INTERNAL_ERROR") {
        return t("auth.errors.register");
      }

      return error.message;
    }

    if (!(error instanceof Error)) {
      return t("auth.errors.signIn");
    }

    const code = error.message.toLowerCase();
    if (code.includes("auth/email-already-in-use")) {
      return t("auth.errors.emailInUse");
    }

    if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password")) {
      return t("auth.errors.invalidCredentials");
    }

    if (code.includes("auth/invalid-email")) {
      return t("auth.errors.invalidEmail");
    }

    if (code.includes("auth/weak-password")) {
      return t("auth.errors.weakPassword");
    }

    return error.message;
  }

  async function handleGoogleSignIn() {
    try {
      setSubmitting(true);
      setSubmitError(null);
      await signInWithGoogle();
    } catch (error) {
      setSubmitError(normalizeError(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEmailSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!canSubmit) {
      setSubmitError(t("auth.errors.validation"));
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      if (mode === "sign-up") {
        await signUpWithEmailPassword(name.trim(), email.trim(), password);
      } else {
        await signInWithEmailPassword(email.trim(), password);
      }
    } catch (error) {
      setSubmitError(normalizeError(error));
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setSubmitError(null);
  }

  if (!authEnabled) {
    return <>{children}</>;
  }

  if (!mounted || status === "loading") {
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
    <div className="grid min-h-screen place-content-center bg-[linear-gradient(135deg,#f4f0ef_0%,#f2f4fb_60%,#f8f9fc_100%)] px-4 py-10">
      <div className="w-full max-w-[540px] rounded-[28px] border border-neutral-200/70 bg-white/90 p-7 shadow-[0_18px_45px_-26px_rgba(15,23,42,0.45)] backdrop-blur sm:p-9">
        <div className="mx-auto grid h-16 w-16 place-content-center rounded-full bg-gradient-to-b from-primary-500 to-primary-400 text-white shadow-lg shadow-primary-500/25">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
            <path d="M5.5 11.8C8.6 8.3 12.2 8.3 15.3 11.8c-3.1-1.7-6.7-1.7-9.8 0Zm-1.8 4.1c4.4-5.2 12.1-5.2 16.5 0-5.2-2.6-11.3-2.6-16.5 0Zm2.7-8.2c2.3-2.6 8.9-2.6 11.2 0-3.5-1.4-7.7-1.4-11.2 0Z" />
          </svg>
        </div>

        <h1 className="mt-6 text-center text-4xl font-semibold tracking-tight text-neutral-900">
          {mode === "sign-up" ? t("auth.signUp.title") : t("auth.signIn.title")}
        </h1>
        <p className="mt-2 text-center text-lg text-neutral-500">
          {mode === "sign-up" ? t("auth.signUp.description") : t("auth.signIn.description")}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => void handleGoogleSignIn()}
            disabled={submitting}
            aria-label={t("auth.provider.google")}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2.1 1.6-4.7 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.3 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.3-4.2 5.6l6.2 5.2C36.9 39 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
          <span className="h-px flex-1 bg-neutral-200" />
          <span>{t("auth.or")}</span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === "sign-up" ? (
            <div className="space-y-1.5">
              <label htmlFor="auth-name" className="text-sm font-medium text-neutral-700">
                {t("auth.fields.name")}
              </label>
              <input
                id="auth-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("auth.fields.namePlaceholder")}
                className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-300 focus-visible:ring-2 focus-visible:ring-primary-200"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="auth-email" className="text-sm font-medium text-neutral-700">
              {t("auth.fields.email")}
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("auth.fields.emailPlaceholder")}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-300 focus-visible:ring-2 focus-visible:ring-primary-200"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="text-sm font-medium text-neutral-700">
              {t("auth.fields.password")}
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("auth.fields.passwordPlaceholder")}
                className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 pr-10 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-300 focus-visible:ring-2 focus-visible:ring-primary-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-content-center rounded-md text-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                aria-label={showPassword ? t("auth.actions.hidePassword") : t("auth.actions.showPassword")}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {showPassword ? (
                    <>
                      <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" />
                      <path d="M10 8.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Z" />
                    </>
                  ) : (
                    <>
                      <path d="M3 3l14 14" />
                      <path d="M2 10s3-5 8-5a8.7 8.7 0 0 1 3.8.9M18 10s-3 5-8 5a8.7 8.7 0 0 1-3.8-.9" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {mode === "sign-up" ? (
            <div className="space-y-1.5">
              <label htmlFor="auth-confirm-password" className="text-sm font-medium text-neutral-700">
                {t("auth.fields.confirmPassword")}
              </label>
              <input
                id="auth-confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t("auth.fields.confirmPasswordPlaceholder")}
                className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-300 focus-visible:ring-2 focus-visible:ring-primary-200"
              />
            </div>
          ) : null}

          {mode === "sign-up" ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {t("auth.signUp.viewerNotice")}
            </p>
          ) : null}

          {authError || submitError ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError ?? authError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? mode === "sign-up"
                ? t("auth.signUp.submitting")
                : t("auth.signIn.submitting")
              : mode === "sign-up"
                ? t("auth.signUp.action")
                : t("auth.signIn.actionEmail")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          {mode === "sign-up" ? t("auth.signUp.switchLabel") : t("auth.signIn.switchLabel")}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "sign-up" ? "sign-in" : "sign-up")}
            className="font-semibold text-neutral-900 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
          >
            {mode === "sign-up" ? t("auth.signUp.switchAction") : t("auth.signIn.switchAction")}
          </button>
        </p>
      </div>
    </div>
  );
}

