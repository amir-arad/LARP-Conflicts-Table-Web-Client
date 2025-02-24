/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type Direction = 'ltr' | 'rtl';
export type Language = 'en' | 'he';

function validateLanguage(
  val: string | null,
  defaultLang: Language = 'he'
): Language {
  if (val === 'he' || val === 'en') return val;
  if (val) {
    console.error(`Invalid language: ${val}`);
  }
  return defaultLang;
}
interface LanguageContextType {
  direction: Direction;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageInner] = useState<Language>(() =>
    validateLanguage(localStorage.getItem(`language`))
  );
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    localStorage.setItem(`language`, language);
    setDirection(language === 'he' ? 'rtl' : 'ltr');
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: string) => {
    setLanguageInner(oldVal => validateLanguage(lang, oldVal));
  }, []);

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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
