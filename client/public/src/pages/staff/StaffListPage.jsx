import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { staffApi, fileUrl } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

export default function StaffListPage() {
  const [searchParams] = useSearchParams();
  const staffType = searchParams.get('type');
  const { t } = useTranslation();
  const { field } = useLanguage();
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
            <h1>{t('nav.staff')}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li>{t('nav.staff')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <table className="table table-bordered table-hover staff-table">
          <thead>
            <tr>
              <th width="5%">#</th>
              <th width="10%">{t('common.photo')}</th>
              <th width="20%">{t('common.name')}</th>
              <th width="20%">{t('common.designation')}</th>
              <th width="15%">{t('common.email')}</th>
              <th width="15%">{t('common.phone')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}>{t('common.loading')}</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6}>{t('common.detailsNotAvailable')}</td></tr>
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
                  <td>{field(staff, 'designation')}</td>
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
