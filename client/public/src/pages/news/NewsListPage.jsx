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

const SIDEBAR_TYPES = ['notice', 'press_release', 'tender_notice', 'news', 'event'];

export default function NewsListPage() {
  const { type } = useParams();
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setIsLoading(true);
    setOffset(0);
    newsApi.list({ module_type: type, limit, offset: 0 }).then((res) => {
      setItems(res.data.data);
      setTotal(res.data.meta?.total || 0);
      setIsLoading(false);
    });
  }, [type]);

  const loadMore = () => {
    const nextOffset = offset + limit;
    newsApi.list({ module_type: type, limit, offset: nextOffset }).then((res) => {
      setItems((prev) => [...prev, ...res.data.data]);
      setOffset(nextOffset);
    });
  };

  const titleKey = MODULE_LABEL_KEYS[type] || 'nav.news';

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{t(titleKey)}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li>{t('nav.noticeBoard')}</li>
              <li>{t(titleKey)}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container">
        <section className="contact-info-section">
          <div className="row clearfix">
            <div className="col-md-9 col-xs-12">
              {isLoading ? (
                <p>{t('common.loading')}</p>
              ) : items.length === 0 ? (
                <p>{t('common.noInformationFound')}</p>
              ) : (
                items.map((item) => (
                  <div className="row border-dot-bottom" key={item.id}>
                    <div className="col-lg-2 col-md-2 col-sm-2 col-xs-2">
                      <div className="tab-date">
                        {(item.bs_date || adToBs(item.ad_date)).split(' ').slice(0, 2).join(' ')}<br />
                        {(item.bs_date || adToBs(item.ad_date)).split(' ')[2] || ''}
                      </div>
                    </div>
                    <div className="col-lg-10 col-md-10 col-sm-10 col-xs-10 bl-2-light-blue title-block">
                      <h2 className="news-title">
                        <Link to={`/news/${type}/${item.slug}`}>{field(item, 'title')}</Link>
                      </h2>
                      {item.file_url && (
                        <a href={fileUrl(item.file_url)} target="_blank" rel="noreferrer" className="news-link">
                          <i className="fa fa-download" /> {t('common.download')}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}

              {items.length < total && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <button type="button" className="btn btn-primary" onClick={loadMore}>{t('common.viewMore')}</button>
                </div>
              )}
            </div>

            <div className="col-md-3 col-xs-12">
              <div className="notice-group-block">
                <ul>
                  {SIDEBAR_TYPES.map((sidebarType) => (
                    <li key={sidebarType}>
                      <Link to={`/news/${sidebarType}`}>{t(MODULE_LABEL_KEYS[sidebarType])}</Link>
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
