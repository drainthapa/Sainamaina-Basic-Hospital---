import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesApi, staffApi, fileUrl } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { getServiceIcon } from '../../utils/serviceIcons';
import './Services.css';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { field } = useLanguage();
  const settings = useSiteSettings();
  const [service, setService] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    servicesApi.getBySlug(slug)
      .then((res) => {
        setService(res.data.data);
        return Promise.all([
          servicesApi.list({ limit: 50 }),
          res.data.data.department_id
            ? staffApi.list({ department_id: res.data.data.department_id, limit: 8 })
            : Promise.resolve({ data: { data: [] } }),
        ]);
      })
      .then(([servicesRes, staffRes]) => {
        setAllServices(servicesRes.data.data);
        setStaff(staffRes.data.data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.loading')}</div>;
  if (notFound || !service) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.contentNotFound')}</div>;

  const icon = getServiceIcon(service);
  const departmentName = field({ name_en: service.department_name_en, name_np: service.department_name_np }, 'name');
  const description = field(service, 'description');
  const otherServices = allServices.filter((s) => s.id !== service.id).slice(0, 8);

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{field(service, 'name')}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li><Link to="/services">{t('nav.services')}</Link></li>
              <li>{field(service, 'name')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '40px' }}>
        <div className="row">
          <div className="col-md-8 col-xs-12">
            <div className="service-detail-hero">
              <div className={`service-detail-icon ${service.is_emergency ? 'service-detail-icon-emergency' : ''}`}>
                <i className={`fa ${icon}`} />
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{field(service, 'name')}</h2>
                {departmentName && (
                  <div className="service-detail-meta">
                    {t('common.department')}: <Link to={`/departments`}>{departmentName}</Link>
                  </div>
                )}
                {service.is_emergency && (
                  <div className="service-detail-badge">
                    <i className="fa fa-ambulance" /> {t('contact.emergency')}
                  </div>
                )}
              </div>
            </div>

            <div className="service-detail-body">
              {description ? <p>{description}</p> : <p>{t('common.contentComingSoon')}</p>}
            </div>

            {staff.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 17, marginBottom: 16 }}>{t('nav.staff')}</h3>
                <div className="row">
                  {staff.map((member) => (
                    <div className="col-md-3 col-sm-4 col-xs-6" key={member.id} style={{ textAlign: 'center', marginBottom: 20 }}>
                      <Link to={`/staff/${member.id}`}>
                        {member.photo_url && (
                          <img
                            src={fileUrl(member.photo_url)}
                            alt={member.full_name}
                            style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        )}
                        <div style={{ marginTop: 8, fontWeight: 600, fontSize: 13.5 }}>{member.full_name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{field(member, 'designation')}</div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-md-4 col-xs-12">
            {/* <div className="service-contact-box" style={{ marginBottom: 20 }}>
              <i className="fa fa-phone" />
              <strong>{t('contact.contactInfo')}</strong>
              <p>{settings.contact?.phone || '+९७७-०७१-४४०४१७'}</p>
              {settings.contact?.emergency_phone && (
                <p style={{ color: '#c0392b', fontWeight: 600 }}>
                  {t('contact.emergency')}: {settings.contact.emergency_phone}
                </p>
              )}
              <Link to="/contact" className="btn btn-primary btn-sm" style={{ marginTop: 10 }}>
                {t('nav.contact')}
              </Link>
            </div> */}

            {otherServices.length > 0 && (
              <div className="service-sidebar-block" >
                <h4>{t('home.otherServices')}</h4>
                <ul className="service-sidebar-list">
                  {otherServices.map((s) => (
                    <li key={s.id} >
                      <Link to={`/services/${s.slug}`}>
                        <i className={`fa ${getServiceIcon(s)}`} /> {field(s, 'name')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
