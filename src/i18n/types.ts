export type Locale = "es" | "en";

export type I18nParams = Record<string, string | number>;

export type TranslationNamespace = Record<string, string>;

export type LocaleDictionary = Record<string, TranslationNamespace>;

type LocaleOption = {
  value: Locale;
  label: string;
};

export type SupportedLocale = LocaleOption;