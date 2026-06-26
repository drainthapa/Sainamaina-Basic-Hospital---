import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsApi, fileUrl } from '../../api/client';
import { adToBs } from '../../hooks/useBsDate';

const MODULE_LABELS = {
  news: 'समाचार', notice: 'सूचना', press_release: 'प्रेस विज्ञप्ति',
  tender_notice: 'बोलपत्र सूचना', health_article: 'स्वास्थ्य सचेतना', event: 'कार्यक्रम तथा गतिविधि',
};

export default function NewsDetailPage() {
  const { type, slug } = useParams();
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

  if (isLoading) return <div className="auto-container" style={{ padding: '40px 0' }}>लोड हुँदैछ...</div>;
  if (notFound || !item) return <div className="auto-container" style={{ padding: '40px 0' }}>सामग्री फेला परेन।</div>;

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{item.title_np}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li><Link to={`/news/${type}`}>{MODULE_LABELS[type]}</Link></li>
              <li>{item.title_np}</li>
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
              {item.summary_np && <p><strong>{item.summary_np}</strong></p>}
              {/* eslint-disable-next-line react/no-danger */}
              <div dangerouslySetInnerHTML={{ __html: item.body_np || item.body_en || '' }} />

              {item.file_url && (
                <p style={{ marginTop: 20 }}>
                  <a href={fileUrl(item.file_url)} target="_blank" rel="noreferrer" className="btn btn-primary">
                    <i className="fa fa-download" /> फाइल डाउनलोड गर्नुहोस्
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
