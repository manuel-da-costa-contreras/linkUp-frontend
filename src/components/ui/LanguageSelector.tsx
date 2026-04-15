"use client";

import { ChangeEvent } from "react";
import type { Locale, SupportedLocale } from "@/i18n/types";

type LanguageSelectorProps = {
  value: Locale;
  options: SupportedLocale[];
  label: string;
  onChange: (nextLocale: Locale) => void;
};

export function LanguageSelector({ value, options, label, onChange }: LanguageSelectorProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;

    if (nextLocale === "es" || nextLocale === "en") {
      onChange(nextLocale);
    }
  }

  return (
    <>
      <label className="sr-only" htmlFor="language-selector">
        {label}
      </label>
      <select
        id="language-selector"
        value={value}
        onChange={handleChange}
        className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 outline-none transition-colors hover:border-neutral-300 focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}
