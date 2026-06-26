import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { downloadsApi, fileUrl } from '../../api/client';
import { adToBs } from '../../hooks/useBsDate';
import { useLanguage } from '../../context/LanguageContext';

const DOC_TYPE_LABEL_KEYS = {
  act: 'downloads.acts', policy: 'downloads.policies', guideline: 'downloads.guidelines',
  form: 'nav.forms', action_plan: 'downloads.actionPlan', budget_program: 'downloads.budgetProgram',
  annual_report: 'downloads.annualReport', other_report: 'downloads.otherReport',
  publication: 'downloads.publications', citizen_charter: 'downloads.citizenCharter',
  unicode_download: 'downloads.unicodeDownloads', other: 'downloads.other',
};

const SIDEBAR_TYPES = [
  'form', 'policy', 'action_plan', 'budget_program',
  'annual_report', 'other_report', 'unicode_download', 'other',
];

export default function DownloadListPage() {
  const { type } = useParams();
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    downloadsApi.list({ doc_type: type, limit: 50 }).then((res) => {
      setItems(res.data.data);
      setIsLoading(false);
    });
  }, [type]);

  const handleDownload = async (item) => {
    try {
      await downloadsApi.track(item.id);
    } catch {
      // tracking failure shouldn't block the actual download
    }
    window.open(fileUrl(item.file_url), '_blank');
  };

  const titleKey = DOC_TYPE_LABEL_KEYS[type] || 'common.download';

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{t(titleKey)}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li>{t('nav.downloadCenter')}</li>
              <li>{t(titleKey)}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <section className="contact-info-section">
          <div className="row clearfix">
            <div className="col-md-3">
              <div className="notice-group-block">
                <ul>
                  {SIDEBAR_TYPES.map((sidebarType) => (
                    <li key={sidebarType}>
                      <Link to={`/downloads/${sidebarType}`}>{t(DOC_TYPE_LABEL_KEYS[sidebarType])}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-md-8">
              <table className="table table-hover table-bordered download-table">
                <thead>
                  <tr>
                    <th width="10%" className="text-center">{t('common.sn')}</th>
                    <th width="70%">{t('common.title')}</th>
                    <th width="10%">{t('common.date')}</th>
                    <th width="10%">{t('common.download')}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={4}>{t('common.loading')}</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={4}>{t('common.detailsNotAvailable')}</td></tr>
                  ) : (
                    items.map((item, i) => (
                      <tr key={item.id}>
                        <td align="center">{i + 1}</td>
                        <td>{field(item, 'title')}</td>
                        <td>{item.bs_date || adToBs(item.ad_date)}</td>
                        <td align="center">
                          <button type="button" className="btn btn-xs btn-primary" onClick={() => handleDownload(item)}>
                            <i className="fa fa-download" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
