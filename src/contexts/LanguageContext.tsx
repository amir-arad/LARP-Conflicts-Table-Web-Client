import React, { createContext, useContext, useEffect, useState } from "react";

type Direction = "ltr" | "rtl";
type Language = "en" | "he";

function getLanguage(override: string | null): Language {
  if (override && ["en", "he"].includes(override)) {
    return override as Language;
  }
  if (override && !["en", "he"].includes(override)) {
    console.error(`Invalid language: ${override}`);
  }
  return "he";
}
interface LanguageContextType {
  direction: Direction;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() =>
    getLanguage(localStorage.getItem(`language`))
  );
  const [direction, setDirection] = useState<Direction>("ltr");

  useEffect(() => {
    localStorage.setItem(`language`, language);
    setDirection(language === "he" ? "rtl" : "ltr");
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    direction,
    language,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
