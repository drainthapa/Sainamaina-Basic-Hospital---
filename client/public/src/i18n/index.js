import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import np from './np';

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    np: { translation: np },
  },
  lng: localStorage.getItem('lang') || 'np',
  fallbackLng: 'np',
  interpolation: { escapeValue: false },
});

export default i18next;
