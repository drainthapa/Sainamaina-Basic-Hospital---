import { createContext, useCallback, useContext, useState } from 'react';
import i18next from '../i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(localStorage.getItem('admin_lang') || 'en');

  const setLang = useCallback((next) => {
    setLangState(next);
    localStorage.setItem('admin_lang', next);
    i18next.changeLanguage(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'np' ? 'en' : 'np');
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
