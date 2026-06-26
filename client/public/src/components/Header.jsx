import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search } from 'lucide-react';
import { NAV_ITEMS } from '../utils/navItems';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useBsDate } from '../hooks/useBsDate';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

const FONT_STEPS = [13, 14, 15, 16, 17, 18, 19, 20];

export default function Header() {
  const navigate = useNavigate();
  const settings = useSiteSettings();
  const bsDateToday = useBsDate();
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [fontStepIndex, setFontStepIndex] = useState(2); // index into FONT_STEPS, default = base size
  const [isInverted, setIsInverted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const applyFontSize = (index) => {
    const clamped = Math.max(0, Math.min(FONT_STEPS.length - 1, index));
    setFontStepIndex(clamped);
    document.documentElement.style.fontSize = `${FONT_STEPS[clamped]}px`;
  };

  const toggleInvert = () => {
    setIsInverted((prev) => {
      document.body.style.filter = !prev ? 'invert(1) hue-rotate(180deg)' : 'none';
      return !prev;
    });
  };

  const handlePrint = () => window.print();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="main-header">
      <div className="auto-container header-upper">
        <div className="noPrint">
          <div className="row justify-content-center top">
            <div className="col-xs-12 col-sm-12 col-md-10 adjustment-buttons">
              <Link to="/sitemap"><i className="fa fa-sitemap" /> {t('header.siteMap')}</Link>
              <a href="#" onClick={(e) => { e.preventDefault(); toggleInvert(); }} title="Invert Color for color blindness">
                <i className="fa fa-adjust" /> {t('header.invertColor')}
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); applyFontSize(fontStepIndex - 1); }} title="Decrease Font Size">A- </a>
              <a href="#" onClick={(e) => { e.preventDefault(); applyFontSize(2); }} title="Original Font Size">A </a>
              <a href="#" onClick={(e) => { e.preventDefault(); applyFontSize(fontStepIndex + 1); }} title="Increase Font Size">A+ </a>
              <a href="#" onClick={(e) => { e.preventDefault(); handlePrint(); }} id="print"><i className="fa fa-print" /> {t('header.print')}</a>
              <span style={{ display: 'inline-block', marginRight: 10 }}><LanguageToggle /></span>
              <a className="col-md-12 DateTime">{bsDateToday}</a>
            </div>

            <div className="col-xs-12 col-sm-12 col-md-2">
              <div className="pull-right">
                <form onSubmit={handleSearchSubmit}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('header.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoComplete="off"
                    />
                    <span className="input-group-btn">
                      <button className="btn btn-primary" type="submit"><Search size={14} /></button>
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="logo-box row">
            <div className="col-md-12">
              <div className="row justify-content-center">
                <div className="col-md-2 col-sm-2 col-xs-3">
                  <div className="gov-logo">
                    <Link to="/"><img src="/assets/images/nepal-logo.png" alt="Nishan Chhap" /></Link>
                  </div>
                </div>
                <div className="col-md-8 col-sm-8 col-xs-9 office-heading">
                  <div className="officeName">
                    <h4 className="gov">{field(settings.site_name, 'municipality') || 'सैनामैना नगरपालिका'}</h4>
                    <h1 className="office-name">{field(settings.site_name, 'name') || 'सैनामैना आधारभुत अस्पताल'}</h1>
                    <h4 className="gov">{field(settings.contact, 'address') || 'सैनामैना-४,मुर्गिया,रुपन्देही'}</h4>
                  </div>
                </div>
                <div className="col-md-2 col-sm-2 hidden-xs">
                  <div className="gov-flag" style={{ textAlign: 'right' }}>
                    <img src="/assets/images/flagofnepal.gif" alt="Nepal Flag" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row nav-outer">
          <div className="col-md-12">
            <div className="clearfix">
              <nav className="main-menu">
                <div className="navbar-header">
                  <button
                    type="button"
                    className="navbar-toggle"
                    onClick={() => setMobileNavOpen((v) => !v)}
                    aria-expanded={mobileNavOpen}
                    aria-label="Toggle navigation"
                  >
                    <span className="icon-bar" />
                    <span className="icon-bar" />
                    <span className="icon-bar" />
                  </button>
                </div>
                <div className={`navbar-collapse collapse clearfix ${mobileNavOpen ? 'in' : ''}`}>
                  <ul className="navigation clearfix">
                    {NAV_ITEMS.map((item) => {
                      if (item.type === 'home') {
                        return (
                          <li key="home" className="current">
                            <NavLink to="/" end><Home size={14} /></NavLink>
                          </li>
                        );
                      }
                      if (item.children) {
                        return (
                          <li key={item.labelKey} className="dropdown">
                            <a href="#" onClick={(e) => e.preventDefault()}>{t(item.labelKey)}</a>
                            <ul>
                              {item.children.map((child) => (
                                <li key={child.to}>
                                  <Link to={child.to}>{t(child.labelKey)}</Link>
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      }
                      return (
                        <li key={item.to}>
                          <NavLink to={item.to}>{t(item.labelKey)}</NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
