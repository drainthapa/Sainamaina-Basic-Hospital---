import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { newsApi, fileUrl } from '../../api/client';
import { adToBs } from '../../hooks/useBsDate';
import { useLanguage } from '../../context/LanguageContext';

const MODULE_LABEL_KEYS = {
  news: 'nav.news', notice: 'nav.notice', press_release: 'nav.pressRelease',
  tender_notice: 'nav.tenderNotice', health_article: 'nav.healthArticle', event: 'nav.events',
};

export default function NewsDetailPage() {
  const { type, slug } = useParams();
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    newsApi.getBySlug(slug)
      .then((res) => setItem(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.loading')}</div>;
  if (notFound || !item) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.contentNotFound')}</div>;

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{field(item, 'title')}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li><Link to={`/news/${type}`}>{t(MODULE_LABEL_KEYS[type])}</Link></li>
              <li>{field(item, 'title')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container">
        <section className="contact-info-section">
          <div className="row clearfix">
            <div className="col-md-9 col-xs-12">
              <div className="tab-date" style={{ marginBottom: 16 }}>
                {item.bs_date || adToBs(item.ad_date)}
              </div>
              {field(item, 'summary') && <p><strong>{field(item, 'summary')}</strong></p>}
              {/* eslint-disable-next-line react/no-danger */}
              <div dangerouslySetInnerHTML={{ __html: field(item, 'body') || '' }} />

              {item.file_url && (
                <p style={{ marginTop: 20 }}>
                  <a href={fileUrl(item.file_url)} target="_blank" rel="noreferrer" className="btn btn-primary">
                    <i className="fa fa-download" /> {t('common.downloadFile')}
                  </a>
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
