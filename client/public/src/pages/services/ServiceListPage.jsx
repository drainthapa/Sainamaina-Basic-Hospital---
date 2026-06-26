import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../../api/client';

export default function ServiceListPage() {
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
            <h1>अस्पताल सेवाहरू</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>अस्पताल सेवाहरू</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        {isLoading ? <p>लोड हुँदैछ...</p> : (
          <>
            {emergency.length > 0 && (
              <>
                <h3 style={{ color: '#c0392b' }}>आकस्मिक सेवा</h3>
                <div className="row" style={{ marginBottom: 24 }}>
                  {emergency.map((service) => <ServiceCard key={service.id} service={service} emergency />)}
                </div>
              </>
            )}
            <h3>अन्य सेवाहरू</h3>
            <div className="row">
              {regular.map((service) => <ServiceCard key={service.id} service={service} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ServiceCard({ service, emergency }) {
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
        <h4>{service.name_np}</h4>
        {service.department_name_np && (
          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{service.department_name_np}</div>
        )}
        {service.description_np && <p style={{ fontSize: 14 }}>{service.description_np}</p>}
      </div>
    </div>
  );
}
