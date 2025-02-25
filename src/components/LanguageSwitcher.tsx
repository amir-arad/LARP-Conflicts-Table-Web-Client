import { Language, useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={e => setLanguage(e.target.value as Language)}
      className="rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="en">English</option>
      <option value="he">עברית</option>
    </select>
  );
}
