import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { departmentsApi, staffApi, fileUrl } from '../../api/client';

export default function DepartmentDetailPage() {
  const { slug } = useParams();
  const [dept, setDept] = useState(null);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    departmentsApi.getBySlug(slug).then((res) => {
      setDept(res.data.data);
      return staffApi.list({ department_id: res.data.data.id, limit: 50 });
    }).then((res) => setStaff(res.data.data))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) return <div className="auto-container" style={{ padding: '40px 0' }}>लोड हुँदैछ...</div>;
  if (!dept) return <div className="auto-container" style={{ padding: '40px 0' }}>फेला परेन।</div>;

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{dept.name_np}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li><Link to="/departments">विभागहरू</Link></li>
              <li>{dept.name_np}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        {dept.image_url && <img src={fileUrl(dept.image_url)} alt={dept.name_np} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', marginBottom: 20, borderRadius: 8 }} />}
        <p>{dept.description_np}</p>

        {staff.length > 0 && (
          <>
            <h3 style={{ marginTop: 24 }}>चिकित्सक तथा कर्मचारी</h3>
            <div className="row">
              {staff.map((member) => (
                <div className="col-md-3 col-sm-6" key={member.id} style={{ marginBottom: 20, textAlign: 'center' }}>
                  <Link to={`/staff/${member.id}`}>
                    {member.photo_url && (
                      <img src={fileUrl(member.photo_url)} alt={member.full_name} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <div style={{ marginTop: 8, fontWeight: 600 }}>{member.full_name}</div>
                    <div style={{ fontSize: 13, color: '#777' }}>{member.designation_np}</div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
