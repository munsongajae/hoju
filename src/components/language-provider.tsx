"use client";

import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { useEffect } from "react";
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
} from "@/lib/language";
import ko from "@/locales/ko.json";
import en from "@/locales/en.json";

const I18N_DEFAULT_NS = "translation";
const I18N_FALLBACK_LANGUAGE: AppLanguage = "ko";

const I18N_RESOURCES = {
  ko: { [I18N_DEFAULT_NS]: ko },
  en: { [I18N_DEFAULT_NS]: en },
};

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    resources: I18N_RESOURCES,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: I18N_FALLBACK_LANGUAGE,
    defaultNS: I18N_DEFAULT_NS,
    interpolation: {
      escapeValue: false,
      prefix: "{",
      suffix: "}",
    },
  });
}

const isAppLanguage = (value: string): value is AppLanguage => {
  return value === "ko" || value === "en";
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const preferredLanguage = saved && isAppLanguage(saved) ? saved : DEFAULT_LANGUAGE;
    if (i18next.language !== preferredLanguage) {
      void i18next.changeLanguage(preferredLanguage);
    }
  }, []);

  useEffect(() => {
    const syncLanguageState = (resolvedLanguage: string) => {
      const normalizedLanguage: AppLanguage = resolvedLanguage.toLowerCase().startsWith("en") ? "en" : "ko";
      if (typeof document !== "undefined") {
        document.documentElement.lang = normalizedLanguage;
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
      }
    };

    syncLanguageState(i18next.resolvedLanguage ?? i18next.language ?? DEFAULT_LANGUAGE);
    i18next.on("languageChanged", syncLanguageState);
    return () => {
      i18next.off("languageChanged", syncLanguageState);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
}
