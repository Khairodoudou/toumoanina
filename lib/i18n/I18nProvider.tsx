"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fr } from "./translations/fr";
import { ar } from "./translations/ar";

export type LanguageCode = "fr" | "ar";
export type Translations = typeof fr;

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType>({
  language: "fr",
  setLanguage: () => {},
  t: fr,
  dir: "ltr",
  isRTL: false,
});

const dictionaries: Record<LanguageCode, Translations> = {
  fr,
  ar,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("toumoanina_lang") as LanguageCode | null;
    if (saved && (saved === "fr" || saved === "ar")) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("toumoanina_lang", lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  };

  const dir = language === "ar" ? "rtl" : "ltr";
  const isRTL = language === "ar";
  const t = dictionaries[language] || fr;

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dir,
        isRTL,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
