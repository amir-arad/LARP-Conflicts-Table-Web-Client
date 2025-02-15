import { useLanguage } from '../contexts/LanguageContext';

export function useRtlUtils() {
  const { language } = useLanguage();
  const isRtl = language === 'he';

  const getTextDirection = (text: string) => {
    // Check if the text starts with Hebrew characters
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(text.charAt(0)) ? 'rtl' : 'ltr';
  };

  const getTextAlignment = (text: string) => {
    return getTextDirection(text) === 'rtl' ? 'right' : 'left';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language).format(num);
  };

  const getContentClass = (text: string) => {
    const dir = getTextDirection(text);
    return `mixed-content ${dir === 'rtl' ? 'input-rtl' : ''}`;
  };

  return {
    isRtl,
    getTextDirection,
    getTextAlignment,
    formatNumber,
    getContentClass,
  };
}
