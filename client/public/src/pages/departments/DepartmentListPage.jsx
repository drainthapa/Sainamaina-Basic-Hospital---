import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { departmentsApi, fileUrl } from '../../api/client';

export default function DepartmentListPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    departmentsApi.list({ limit: 50 }).then((res) => {
      setItems(res.data.data);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>विभागहरू</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>विभागहरू</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        {isLoading ? <p>लोड हुँदैछ...</p> : (
          <div className="row">
            {items.map((dept) => (
              <div className="col-md-4 col-sm-6" key={dept.id} style={{ marginBottom: 24 }}>
                <Link to={`/departments/${dept.slug}`} className="department-card" style={{ display: 'block', border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                  {dept.image_url && (
                    <img src={fileUrl(dept.image_url)} alt={dept.name_np} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: 16 }}>
                    <h4>{dept.name_np}</h4>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
