import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '../utils/navItems';

export default function SiteMap() {
  const { t } = useTranslation();

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{t('common.siteMap')}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li>{t('common.siteMap')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <div className="row">
          <div className="col-md-3">
            <h4><Link to="/">{t('common.home')}</Link></h4>
          </div>
          {NAV_ITEMS.filter((item) => item.children || item.to).map((item) => (
            <div className="col-md-3" key={item.labelKey || item.to} style={{ marginBottom: 20 }}>
              {item.children ? (
                <>
                  <h4>{t(item.labelKey)}</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {item.children.map((child) => (
                      <li key={child.to} style={{ marginBottom: 6 }}>
                        <Link to={child.to}>{t(child.labelKey)}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : item.type !== 'home' && (
                <h4><Link to={item.to}>{t(item.labelKey)}</Link></h4>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
