import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Marquee from '../components/Marquee';
import HeroSlider from '../components/HeroSlider';
import VipMembers from '../components/VipMembers';
import HomeNewsTabs from '../components/HomeNewsTabs';
import DocumentTabs from '../components/DocumentTabs';
import GalleryPreview from '../components/GalleryPreview';
import { newsApi, staffApi, downloadsApi, galleryApi, contentApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

const E_GOV_LINKS = [
  { labelKey: 'home.officeAutomation', icon: 'fa-gears', url: 'http://automation.opmcm.gov.np/' },
  { labelKey: 'home.eAttendance', icon: 'fa-user', url: 'http://attendance.gov.np/' },
  { labelKey: 'common.email', icon: 'fa-envelope', url: 'https://mail.nepal.gov.np/' },
  { labelKey: 'nav.contact', icon: 'fa-phone', to: '/contact' },
  { labelKey: 'common.siteMap', icon: 'fa-globe', to: '/sitemap' },
  { labelKey: 'home.eTender', icon: 'fa-book', url: 'https://bolpatra.gov.np/' },
];

const DOC_TABS_TYPES = ['policy', 'act', 'guideline', 'action_plan'];
const NEWS_TABS_TYPES = ['notice', 'health_article', 'news', 'event'];

export default function Home() {
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [notices, setNotices] = useState([]);
  const [vipMembers, setVipMembers] = useState([]);
  const [docsByType, setDocsByType] = useState({});
  const [newsByType, setNewsByType] = useState({});
  const [galleryItems, setGalleryItems] = useState([]);
  const [introPage, setIntroPage] = useState(null);

  useEffect(() => {
    newsApi.list({ module_type: 'notice', limit: 5 }).then((res) => setNotices(res.data.data)).catch(() => {});
    staffApi.list({ staff_type: 'administrative', limit: 3 }).then((res) => setVipMembers(res.data.data)).catch(() => {});
    galleryApi.listAlbums({ album_type: 'photo', limit: 8 }).then((res) => setGalleryItems(res.data.data)).catch(() => {});
    contentApi.getPage('introduction').then((res) => setIntroPage(res.data.data)).catch(() => {});

    Promise.all(
      DOC_TABS_TYPES.map((type) => downloadsApi.list({ doc_type: type, limit: 8 }))
    ).then((results) => {
      const map = {};
      DOC_TABS_TYPES.forEach((type, i) => { map[type] = results[i].data.data; });
      setDocsByType(map);
    }).catch(() => {});

    Promise.all(
      NEWS_TABS_TYPES.map((type) => newsApi.list({ module_type: type, limit: 5 }))
    ).then((results) => {
      const map = {};
      NEWS_TABS_TYPES.forEach((type, i) => { map[type] = results[i].data.data; });
      setNewsByType(map);
    }).catch(() => {});
  }, []);

  const introFallback = 'सैनामैना आधारभूत अस्पताल (सैनामैना नगर अस्पताल) लुम्बिनी प्रदेश अन्तर्गत रुपन्देही जिल्लाको सैनामैना नगरपालिका वडा नं. ४, मुर्गियामा अवस्थित एक स्थानीय सरकारी स्वास्थ्य संस्था हो।';
  const introContent = introPage ? field(introPage, 'content') : '';

  return (
    <div className="pattern">
      <div className="container">
        <div className="row">
          <div className="col-md-3 col-sm-12">
            <HomeNewsTabs itemsByType={newsByType} />
          </div>

          <div className="col-md-6 col-sm-12">
            <section className="main-slider">
              <div className="row">
                <div className="col-md-12 col-xs-12">
                  <Marquee items={notices} />
                </div>
              </div>
              <HeroSlider />
            </section>
          </div>

          <div className="col-md-3 col-sm-12">
            <VipMembers members={vipMembers} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-7 col-sm-12">
            <h2 className="intro_title">
              <span><i className="fa fa-clone" /> {t('home.introTitle')}</span>
            </h2>
            <div className="intro_content">
              {introContent ? (
                // eslint-disable-next-line react/no-danger
                <div style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: introContent }} />
              ) : (
                <p style={{ textAlign: 'justify' }}>{introFallback}</p>
              )}
              <p style={{ textAlign: 'justify' }}>
                <Link className="btn btn-xs btn-primary pull-right" to="/about/introduction">
                  <i className="fa fa-arrow-right" /> {t('common.readMore')}
                </Link>
              </p>
            </div>
          </div>

          <div className="col-md-5 col-sm-12">
            <div className="e-service-content">
              <h2 className="service-title">{t('home.egovServices')}</h2>
              <div className="row">
                {E_GOV_LINKS.map((link, i) => (
                  <div className="col-sm-6" key={`${link.labelKey}-${i}`}>
                    <div className="e-box">
                      {link.to ? (
                        <Link to={link.to}><i className={`fa ${link.icon} fa-lg`} /> {t(link.labelKey)}</Link>
                      ) : (
                        <a href={link.url} target="_blank" rel="noreferrer"><i className={`fa ${link.icon} fa-lg`} /> {t(link.labelKey)}</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DocumentTabs documentsByType={docsByType} />
      <GalleryPreview items={galleryItems} />
    </div>
  );
}
