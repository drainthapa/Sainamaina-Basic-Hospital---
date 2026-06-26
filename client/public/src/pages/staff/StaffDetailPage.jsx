import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { staffApi, fileUrl } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

export default function StaffDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [staff, setStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    staffApi.getById(id).then((res) => setStaff(res.data.data)).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.loading')}</div>;
  if (!staff) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.notFound')}</div>;

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{staff.full_name}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li><Link to="/staff">{t('nav.staff')}</Link></li>
              <li>{staff.full_name}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px' }}>
        <div className="row">
          <div className="col-md-3">
            {staff.photo_url && <img src={fileUrl(staff.photo_url)} alt={staff.full_name} style={{ width: '100%', borderRadius: 8 }} />}
          </div>
          <div className="col-md-9">
            <h3>{field(staff, 'designation')}</h3>
            {staff.department_name_np && <p><strong>{t('common.department')}:</strong> {field({ name_en: staff.department_name_en, name_np: staff.department_name_np }, 'name')}</p>}
            {staff.qualification && <p><strong>{t('common.qualification')}:</strong> {staff.qualification}</p>}
            {staff.specialization && <p><strong>{t('common.specialization')}:</strong> {staff.specialization}</p>}
            {staff.email && <p><strong>{t('common.email')}:</strong> {staff.email}</p>}
            {staff.phone && <p><strong>{t('common.phone')}:</strong> {staff.phone}</p>}
            {field(staff, 'biography') && <p style={{ marginTop: 16 }}>{field(staff, 'biography')}</p>}

            {staff.schedules && staff.schedules.length > 0 && (
              <>
                <h4 style={{ marginTop: 20 }}>{t('staff.availability')}</h4>
                <table className="table table-bordered" style={{ maxWidth: 420 }}>
                  <thead>
                    <tr><th>{t('staff.day')}</th><th>{t('staff.time')}</th></tr>
                  </thead>
                  <tbody>
                    {staff.schedules.map((s) => (
                      <tr key={s.id}>
                        <td>{t(`staff.days.${s.day_of_week}`)}</td>
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
