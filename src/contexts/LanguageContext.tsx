import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import en from "@/i18n/en";
import { loadTranslations } from "@/i18n";

export type Language = "en" | "ja" | "es" | "fr" | "de" | "pt" | "ko" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("bibue-language");
    return (saved as Language) || "en";
  });

  const loadedRef = useRef<Record<string, Record<string, string>>>({ en });
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    localStorage.setItem("bibue-language", language);
    document.documentElement.lang = language;

    if (language !== "en" && !loadedRef.current[language]) {
      loadTranslations(language).then((translations) => {
        loadedRef.current[language] = translations;
        forceUpdate((n) => n + 1);
      });
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const langData = loadedRef.current[language];
    return langData?.[key] || en[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
