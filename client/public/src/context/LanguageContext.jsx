import { createContext, useCallback, useContext, useState } from 'react';
import i18next from '../i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(localStorage.getItem('lang') || 'np');

  const setLang = useCallback((next) => {
    setLangState(next);
    localStorage.setItem('lang', next);
    i18next.changeLanguage(next);
    document.documentElement.lang = next === 'np' ? 'ne' : 'en';
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'np' ? 'en' : 'np');
  }, [lang, setLang]);

  /**
   * Picks the language-appropriate field from a data object that follows the
   * _en/_np naming convention used throughout the API (e.g. title_en/title_np).
   * Falls back to whichever language has content if the active one is empty,
   * so partially-translated CMS content never shows blank.
   * @param {object} obj - e.g. a department, news item, staff member
   * @param {string} base - field name without suffix, e.g. 'title', 'name'
   */
  const field = useCallback((obj, base) => {
    if (!obj) return '';
    const primary = lang === 'np' ? `${base}_np` : `${base}_en`;
    const secondary = lang === 'np' ? `${base}_en` : `${base}_np`;
    return obj[primary] || obj[secondary] || '';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, field }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
