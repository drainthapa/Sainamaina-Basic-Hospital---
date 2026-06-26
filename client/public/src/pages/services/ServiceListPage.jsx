import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesApi } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { getServiceIcon } from '../../utils/serviceIcons';
import './Services.css';

export default function ServiceListPage() {
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    servicesApi.list({ limit: 50 }).then((res) => {
      setItems(res.data.data);
      setIsLoading(false);
    });
  }, []);

  const emergency = items.filter((s) => s.is_emergency);
  const regular = items.filter((s) => !s.is_emergency);

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{t('nav.services')}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li>{t('nav.services')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '40px' }}>
        {isLoading ? (
          <p>{t('common.loading')}</p>
        ) : items.length === 0 ? (
          <p>{t('common.detailsNotAvailable')}</p>
        ) : (
          <>
            {emergency.length > 0 && (
              <div className="services-group services-group-emergency">
                <h3 className="services-group-title services-group-title-emergency">
                  <i className="fa fa-ambulance" /> {t('home.emergencyServices')}
                </h3>
                <div className="row">
                  {emergency.map((service) => (
                    <ServiceCard key={service.id} service={service} emergency field={field} />
                  ))}
                </div>
              </div>
            )}

            {regular.length > 0 && (
              <div className="services-group">
                <h3 className="services-group-title">{t('home.otherServices')}</h3>
                <div className="row">
                  {regular.map((service) => (
                    <ServiceCard key={service.id} service={service} field={field} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function ServiceCard({ service, emergency, field }) {
  const departmentName = field({ name_en: service.department_name_en, name_np: service.department_name_np }, 'name');
  const icon = getServiceIcon(service);
  const description = field(service, 'description');

  return (
    <div className="col-md-4 col-sm-6 col-xs-12">
      <Link to={`/services/${service.slug}`} className={`service-card ${emergency ? 'service-card-emergency' : ''}`}>
        <div className="service-card-icon">
          <i className={`fa ${icon}`} />
        </div>
        <h4 className="service-card-title">{field(service, 'name')}</h4>
        {departmentName && <div className="service-card-department">{departmentName}</div>}
        {description && <p className="service-card-text">{description}</p>}
        <span className="service-card-link">
          <i className="fa fa-arrow-right" />
        </span>
      </Link>
    </div>
  );
}
