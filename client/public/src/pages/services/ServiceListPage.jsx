import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesApi } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

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

      <div className="auto-container" style={{ padding: '30px 0' }}>
        {isLoading ? <p>{t('common.loading')}</p> : (
          <>
            {emergency.length > 0 && (
              <>
                <h3 style={{ color: '#c0392b' }}>{t('home.emergencyServices')}</h3>
                <div className="row" style={{ marginBottom: 24 }}>
                  {emergency.map((service) => <ServiceCard key={service.id} service={service} emergency field={field} />)}
                </div>
              </>
            )}
            <h3>{t('home.otherServices')}</h3>
            <div className="row">
              {regular.map((service) => <ServiceCard key={service.id} service={service} field={field} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ServiceCard({ service, emergency, field }) {
  const departmentName = field({ name_en: service.department_name_en, name_np: service.department_name_np }, 'name');
  return (
    <div className="col-md-4 col-sm-6" style={{ marginBottom: 20 }}>
      <div
        style={{
          border: `1px solid ${emergency ? '#e6b3ad' : '#eee'}`,
          background: emergency ? '#fdf3f1' : '#fff',
          borderRadius: 8,
          padding: 18,
          height: '100%',
        }}
      >
        <h4>{field(service, 'name')}</h4>
        {departmentName && (
          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{departmentName}</div>
        )}
        {field(service, 'description') && <p style={{ fontSize: 14 }}>{field(service, 'description')}</p>}
      </div>
    </div>
  );
}
