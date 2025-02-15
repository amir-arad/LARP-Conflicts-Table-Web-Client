import { IntlProvider } from 'react-intl';
import React from 'react';
import en from './messages/en.json';
import he from './messages/he.json';
import { useLanguage } from '../contexts/LanguageContext';

const messages = {
  en,
  he,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  return (
    <IntlProvider
      messages={messages[language]}
      locale={language}
      defaultLocale="en"
    >
      {children}
    </IntlProvider>
  );
}
