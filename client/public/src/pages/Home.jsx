import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Marquee from '../components/Marquee';
import HeroSlider from '../components/HeroSlider';
import VipMembers from '../components/VipMembers';
import DocumentTabs from '../components/DocumentTabs';
import GalleryPreview from '../components/GalleryPreview';
import { newsApi, staffApi, downloadsApi, galleryApi } from '../api/client';

const E_GOV_LINKS = [
  { label: 'अफिस अटोमेशन', icon: 'fa-gears', url: 'http://automation.opmcm.gov.np/' },
  { label: 'विद्युतीय हाजिरी', icon: 'fa-user', url: 'http://attendance.gov.np/' },
  { label: 'ई-मेल', icon: 'fa-envelope', url: 'https://mail.nepal.gov.np/' },
  { label: 'सम्पर्क', icon: 'fa-phone', to: '/contact' },
  { label: 'साईट म्याप', icon: 'fa-globe', to: '/sitemap' },
  { label: 'ई-टेन्डर', icon: 'fa-book', url: 'https://bolpatra.gov.np/' },
];

const DOC_TABS_TYPES = ['policy', 'act', 'guideline', 'action_plan'];

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [vipMembers, setVipMembers] = useState([]);
  const [docsByType, setDocsByType] = useState({});
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    newsApi.list({ module_type: 'notice', limit: 5 }).then((res) => setNotices(res.data.data)).catch(() => {});
    staffApi.list({ staff_type: 'administrative', limit: 3 }).then((res) => setVipMembers(res.data.data)).catch(() => {});
    galleryApi.listAlbums({ album_type: 'photo', limit: 8 }).then((res) => setGalleryItems(res.data.data)).catch(() => {});
    Promise.all(
      DOC_TABS_TYPES.map((type) => downloadsApi.list({ doc_type: type, limit: 8 }))
    ).then((results) => {
      const map = {};
      DOC_TABS_TYPES.forEach((type, i) => { map[type] = results[i].data.data; });
      setDocsByType(map);
    }).catch(() => {});
  }, []);

  return (
    <>
      <div className="auto-container">
        <div className="row">
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

          <div className="col-md-3 col-sm-12">
            <div className="e-service-content">
              <h2 className="service-title">विद्युतीय शासन सेवा</h2>
              <div className="row">
                {E_GOV_LINKS.map((link) => (
                  <div className="col-sm-6" key={link.label}>
                    <div className="e-box">
                      {link.to ? (
                        <Link to={link.to}><i className={`fa ${link.icon} fa-lg`} /> {link.label}</Link>
                      ) : (
                        <a href={link.url} target="_blank" rel="noreferrer"><i className={`fa ${link.icon} fa-lg`} /> {link.label}</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 col-sm-12">
            <h2 className="intro_title">
              <span><i className="fa fa-clone" /> परिचय</span>
            </h2>
            <div className="intro_content">
              <p style={{ textAlign: 'justify' }}>
                सैनामैना आधारभूत अस्पताल (सैनामैना नगर अस्पताल) लुम्बिनी प्रदेश अन्तर्गत रुपन्देही जिल्लाको
                सैनामैना नगरपालिका वडा नं. ४, मुर्गियामा अवस्थित एक स्थानीय सरकारी स्वास्थ्य संस्था हो। प्रत्येक
                नागरिकलाई पायक पर्ने स्थानमा गुणस्तरीय स्वास्थ्य सेवा पुर्‍याउने उद्देश्यका साथ नेपाल सरकारको
                "एक स्थानीय तह, एक आधारभूत अस्पताल" नीति अन्तर्गत यस अस्पतालको स्थापना गरिएको हो।
              </p>
              <p style={{ textAlign: 'justify' }}>
                <Link className="btn btn-xs btn-primary pull-right" to="/about/introduction">
                  <i className="fa fa-arrow-right" /> थप पढ्नुहोस्
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <DocumentTabs documentsByType={docsByType} />
      <GalleryPreview items={galleryItems} />
    </>
  );
}
