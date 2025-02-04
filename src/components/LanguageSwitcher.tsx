import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'en' | 'he')}
      className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="en">English</option>
      <option value="he">עברית</option>
    </select>
  );
}