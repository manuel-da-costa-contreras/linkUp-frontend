import type { SupportedLocale } from "./types";

export const I18N_STORAGE_KEY = "app-locale";

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
];

export const DEFAULT_LOCALE = "es" as const;