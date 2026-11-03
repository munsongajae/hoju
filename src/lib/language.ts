export const LANGUAGE_STORAGE_KEY = "appLanguage";

export const SUPPORTED_LANGUAGES = ["ko", "en"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "ko";

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  ko: "한국어",
  en: "English",
};
