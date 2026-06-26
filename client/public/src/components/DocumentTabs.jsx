import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { fileUrl } from '../api/client';

const TABS = [
  { key: 'policy', label: 'नीति' },
  { key: 'act', label: 'ऐन' },
  { key: 'guideline', label: 'नियमावली' },
  { key: 'action_plan', label: 'कार्यविधी / कार्ययोजना' },
];

export default function DocumentTabs({ documentsByType }) {
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
                      {tab.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="tab-content">
                <div className="tab-pane active in" role="tabpanel">
                  {items.length === 0 ? (
                    <p style={{ padding: '20px 0', color: '#888' }}>छिट्टै आउंदै छ!</p>
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
                            <p>{doc.title_np}</p>
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
