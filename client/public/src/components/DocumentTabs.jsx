import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/navigation';
import { fileUrl } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

const TABS = [
  { key: 'policy', labelKey: 'downloads.policies' },
  { key: 'act', labelKey: 'downloads.acts' },
  { key: 'guideline', labelKey: 'downloads.guidelines' },
  { key: 'action_plan', labelKey: 'downloads.actionPlan' },
];

export default function DocumentTabs({ documentsByType }) {
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const items = documentsByType[activeTab] || [];

  return (
    <section className="home-documents">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <div className="tap-box">
              <ul className="nav nav-tabs tab-menu-1 nav-tab-menu-1" role="tablist">
                {TABS.map((tab) => (
                  <li key={tab.key} className={`nav-item ${activeTab === tab.key ? 'active' : ''}`} role="presentation">
                    <a
                      className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab(tab.key); }}
                      role="tab"
                    >
                      {t(tab.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="tab-content">
                <div className="tab-pane active in" role="tabpanel">
                  {items.length === 0 ? (
                    <p style={{ padding: '20px 0', color: '#888' }}>{t('common.comingSoon')}</p>
                  ) : (
                    <Swiper
                      modules={[Navigation]}
                      navigation
                      slidesPerView={4}
                      spaceBetween={16}
                      breakpoints={{
                        0: { slidesPerView: 1 },
                        576: { slidesPerView: 2 },
                        992: { slidesPerView: 4 },
                      }}
                      className="causes-carousel"
                    >
                      {items.map((doc) => (
                        <SwiperSlide key={doc.id}>
                          <a href={fileUrl(doc.file_url)} target="_blank" rel="noreferrer" className="report-slider-block2 media-box format-standard">
                            <img src="/assets/images/actandrules/cover.jpg" alt="" />
                            <p>{field(doc, 'title')}</p>
                          </a>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
