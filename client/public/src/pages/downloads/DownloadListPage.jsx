import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { downloadsApi, fileUrl } from '../../api/client';
import { adToBs } from '../../hooks/useBsDate';

const DOC_TYPE_LABELS = {
  act: 'ऐन', policy: 'नीति', guideline: 'निर्देशिका', form: 'फारामहरू',
  action_plan: 'कार्यविधी / कार्ययोजना', budget_program: 'बजेट तथा कार्यक्रम',
  annual_report: 'बार्षिक प्रतिवेदन', other_report: 'अन्य प्रतिवेदन',
  publication: 'प्रकाशनहरू', citizen_charter: 'नागरिक वडापत्र',
  unicode_download: 'युनिकोड डाउनलोड्स', other: 'अन्य डाउनलोड्स',
};

export default function DownloadListPage() {
  const { type } = useParams();
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

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{DOC_TYPE_LABELS[type] || 'डाउनलोड'}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>डाउनलोड केन्द्र</li>
              <li>{DOC_TYPE_LABELS[type]}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <table className="table table-hover table-bordered download-table">
          <thead>
            <tr>
              <th width="10%" className="text-center">क्र.सं.</th>
              <th width="70%">शीर्षक</th>
              <th width="10%">मिति</th>
              <th width="10%">डाउनलोड</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4}>लोड हुँदैछ...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4}>विवरण उपलब्ध हुन सकेन!</td></tr>
            ) : (
              items.map((item, i) => (
                <tr key={item.id}>
                  <td align="center">{i + 1}</td>
                  <td>{item.title_np}</td>
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
    </>
  );
}
