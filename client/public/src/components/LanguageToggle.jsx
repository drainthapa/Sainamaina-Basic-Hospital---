import { useLanguage } from '../context/LanguageContext';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={toggleLang}
      aria-label="Switch language"
      title={lang === 'np' ? 'Switch to English' : 'नेपालीमा बदलनुहोस्'}
    >
      <span className={lang === 'np' ? 'lang-option active' : 'lang-option'}>नेपाली</span>
      <span className="lang-divider">/</span>
      <span className={lang === 'en' ? 'lang-option active' : 'lang-option'}>EN</span>
    </button>
  );
}
