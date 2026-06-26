import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { staffApi, fileUrl } from '../../api/client';

const STAFF_TYPE_LABELS = {
  doctor: 'चिकित्सक', nursing: 'नर्सिङ्ग', administrative: 'प्रशासन',
  technical: 'प्राविधिक', support: 'सहायक',
};

export default function StaffListPage() {
  const [searchParams] = useSearchParams();
  const staffType = searchParams.get('type');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    staffApi.list({ staff_type: staffType || undefined, limit: 100 }).then((res) => {
      setItems(res.data.data);
      setIsLoading(false);
    });
  }, [staffType]);

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>चिकित्सक तथा कर्मचारी</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>चिकित्सक तथा कर्मचारी</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <table className="table table-bordered table-hover staff-table">
          <thead>
            <tr>
              <th width="5%">#</th>
              <th width="10%">फोटो</th>
              <th width="20%">नाम</th>
              <th width="20%">पद</th>
              <th width="15%">इमेल</th>
              <th width="15%">सम्पर्क नं.</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}>लोड हुँदैछ...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6}>विवरण उपलब्ध हुन सकेन!</td></tr>
            ) : (
              items.map((staff, i) => (
                <tr key={staff.id}>
                  <td align="center">{i + 1}</td>
                  <td className="img">
                    {staff.photo_url && (
                      <img src={fileUrl(staff.photo_url)} alt={staff.full_name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%' }} />
                    )}
                  </td>
                  <td><Link to={`/staff/${staff.id}`}>{staff.full_name}</Link></td>
                  <td>{staff.designation_np}</td>
                  <td>{staff.email || '......'}</td>
                  <td>{staff.phone || '......'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
