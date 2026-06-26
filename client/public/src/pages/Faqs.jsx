import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { contentApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

const SIDEBAR_LINKS = [
  { type: 'notice', labelKey: 'nav.notice' },
  { type: 'press_release', labelKey: 'nav.pressRelease' },
  { type: 'tender_notice', labelKey: 'nav.tenderNotice' },
  { type: 'news', labelKey: 'nav.news' },
  { type: 'event', labelKey: 'nav.events' },
];

export default function Faqs() {
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    contentApi.listFaqs().then((res) => {
      setFaqs(res.data.data);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{t('faq.title')}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li>{t('faq.title')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <section className="contact-info-section">
          <div className="row clearfix">
            <div className="col-md-3 col-xs-12">
              <div className="notice-group-block">
                <ul>
                  {SIDEBAR_LINKS.map((link) => (
                    <li key={link.type}>
                      <Link to={`/news/${link.type}`}>{t(link.labelKey)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-md-9 col-xs-12">
              <section className="faq-container">
                {isLoading ? <p>{t('common.loading')}</p> : faqs.length === 0 ? <p>{t('faq.noQuestions')}</p> : (
                  <div className="accordion-box">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="faq-box">
                        <h1
                          className="faq-page"
                          onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {field(faq, 'question')}
                        </h1>
                        {openId === faq.id && <p>{field(faq, 'answer')}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
