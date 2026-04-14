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
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none transition-colors hover:border-zinc-300 focus:border-cyan-500"
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