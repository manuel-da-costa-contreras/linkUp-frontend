"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, I18N_STORAGE_KEY, SUPPORTED_LOCALES } from "./config";
import { dictionaries } from "./dictionary";
import type { I18nParams, Locale, SupportedLocale } from "./types";

type I18nContextValue = {
  locale: Locale;
  locales: SupportedLocale[];
  setLocale: (nextLocale: Locale) => void;
  t: (key: string, params?: I18nParams) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  locale?: Locale;
  children: ReactNode;
};

export function I18nProvider({ locale = DEFAULT_LOCALE, children }: I18nProviderProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return locale;
    }

    const storedLocale = window.localStorage.getItem(I18N_STORAGE_KEY);
    if (storedLocale === "es" || storedLocale === "en") {
      return storedLocale;
    }

    return locale;
  });

  useEffect(() => {
    window.localStorage.setItem(I18N_STORAGE_KEY, currentLocale);
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  const value = useMemo<I18nContextValue>(() => {
    return {
      locale: currentLocale,
      locales: SUPPORTED_LOCALES,
      setLocale: setCurrentLocale,
      t: (key, params) => translate(currentLocale, key, params),
    };
  }, [currentLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}

function translate(locale: Locale, key: string, params?: I18nParams) {
  const [namespace, ...rest] = key.split(".");
  const localKey = rest.join(".");

  if (!namespace || !localKey) {
    return key;
  }

  const message =
    dictionaries[locale]?.[namespace]?.[localKey] ?? dictionaries[DEFAULT_LOCALE]?.[namespace]?.[localKey] ?? key;

  if (!params) {
    return message;
  }

  return Object.entries(params).reduce((result, [paramKey, value]) => {
    return result.replaceAll(`{{${paramKey}}}`, String(value));
  }, message);
}