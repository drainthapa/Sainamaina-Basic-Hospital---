import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { contentApi } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

// Slugs match the seeded /content/pages slugs from the backend.
const SLUG_MAP = {
  organization: 'organization-structure',
};

const ABOUT_SIDEBAR_LINKS = [
  { labelKey: 'nav.introduction', to: '/about/introduction' },
  { labelKey: 'nav.history', to: '/about/history' },
  { labelKey: 'nav.objectives', to: '/about/objectives' },
  { labelKey: 'nav.organization', to: '/about/organization' },
  { labelKey: 'nav.managementCommittee', to: '/staff?type=administrative' },
];

export default function StaticPage() {
  const { pageKey } = useParams();
  const slug = SLUG_MAP[pageKey] || pageKey;
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    contentApi.getPage(slug).then((res) => setPage(res.data.data)).finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.loading')}</div>;
  if (!page) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.pageNotFound')}</div>;

  const title = field(page, 'title');
  const content = field(page, 'content');

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{title}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li>{t('nav.about')}</li>
              <li>{title}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <section className="contact-info-section">
          <div className="row clearfix">
            <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12" id="content">
              <div className="pages_back">
                <div className="blog-item">
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: content || `<p>${t('common.contentComingSoon')}</p>` }} />
                </div>
              </div>
            </div>

            <div className="col-md-3 col-xs-12">
              <div className="notice-group-block">
                <ul>
                  {ABOUT_SIDEBAR_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>{t(link.labelKey)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
