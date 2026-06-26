import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { staffApi, fileUrl } from '../../api/client';

const DAYS_NP = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'];

export default function StaffDetailPage() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    staffApi.getById(id).then((res) => setStaff(res.data.data)).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="auto-container" style={{ padding: '40px 0' }}>लोड हुँदैछ...</div>;
  if (!staff) return <div className="auto-container" style={{ padding: '40px 0' }}>फेला परेन।</div>;

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{staff.full_name}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li><Link to="/staff">चिकित्सक तथा कर्मचारी</Link></li>
              <li>{staff.full_name}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <div className="row">
          <div className="col-md-3">
            {staff.photo_url && <img src={fileUrl(staff.photo_url)} alt={staff.full_name} style={{ width: '100%', borderRadius: 8 }} />}
          </div>
          <div className="col-md-9">
            <h3>{staff.designation_np}</h3>
            {staff.department_name_np && <p><strong>विभाग:</strong> {staff.department_name_np}</p>}
            {staff.qualification && <p><strong>योग्यता:</strong> {staff.qualification}</p>}
            {staff.specialization && <p><strong>विशेषज्ञता:</strong> {staff.specialization}</p>}
            {staff.email && <p><strong>इमेल:</strong> {staff.email}</p>}
            {staff.phone && <p><strong>सम्पर्क:</strong> {staff.phone}</p>}
            {staff.biography_np && <p style={{ marginTop: 16 }}>{staff.biography_np}</p>}

            {staff.schedules && staff.schedules.length > 0 && (
              <>
                <h4 style={{ marginTop: 20 }}>उपलब्धता समय</h4>
                <table className="table table-bordered" style={{ maxWidth: 420 }}>
                  <thead>
                    <tr><th>दिन</th><th>समय</th></tr>
                  </thead>
                  <tbody>
                    {staff.schedules.map((s) => (
                      <tr key={s.id}>
                        <td>{DAYS_NP[s.day_of_week]}</td>
                        <td>{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
