import { useLanguage } from '../context/LanguageContext';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      className="admin-lang-toggle"
      onClick={toggleLang}
      title={lang === 'en' ? 'नेपालीमा बदलनुहोस्' : 'Switch to English'}
    >
      <span className={lang === 'en' ? 'active' : ''}>EN</span>
      <span className="divider">/</span>
      <span className={lang === 'np' ? 'active' : ''}>नेपाली</span>
    </button>
  );
}
