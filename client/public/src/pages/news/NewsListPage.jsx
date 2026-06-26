import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsApi } from '../../api/client';
import { adToBs } from '../../hooks/useBsDate';
import { fileUrl } from '../../api/client';

const MODULE_LABELS = {
  news: 'समाचार', notice: 'सूचना', press_release: 'प्रेस विज्ञप्ति',
  tender_notice: 'बोलपत्र सूचना', health_article: 'स्वास्थ्य सचेतना', event: 'कार्यक्रम तथा गतिविधि',
};

const SIDEBAR_LINKS = [
  { type: 'notice', label: 'सूचना' },
  { type: 'press_release', label: 'प्रेस विज्ञप्ति' },
  { type: 'tender_notice', label: 'बोलपत्र सूचना' },
  { type: 'news', label: 'समाचार' },
  { type: 'event', label: 'कार्यक्रम तथा गतिविधि' },
];

export default function NewsListPage() {
  const { type } = useParams();
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

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{MODULE_LABELS[type] || 'समाचार'}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>सूचना पाटी</li>
              <li>{MODULE_LABELS[type]}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container">
        <section className="contact-info-section">
          <div className="row clearfix">
            <div className="col-md-9 col-xs-12">
              {isLoading ? (
                <p>लोड हुँदैछ...</p>
              ) : items.length === 0 ? (
                <p>कुनै जानकारी फेला परेन।</p>
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
                        <Link to={`/news/${type}/${item.slug}`}>{item.title_np}</Link>
                      </h2>
                      {item.file_url && (
                        <a href={fileUrl(item.file_url)} target="_blank" rel="noreferrer" className="news-link">
                          <i className="fa fa-download" /> डाउलोड
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}

              {items.length < total && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <button type="button" className="btn btn-primary" onClick={loadMore}>थप हेर्नुहोस्</button>
                </div>
              )}
            </div>

            <div className="col-md-3 col-xs-12">
              <div className="notice-group-block">
                <ul>
                  {SIDEBAR_LINKS.map((link) => (
                    <li key={link.type}>
                      <Link to={`/news/${link.type}`}>{link.label}</Link>
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
