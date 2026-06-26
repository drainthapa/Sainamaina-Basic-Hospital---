import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pagesApi } from '../../api/modules';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import { Pencil } from 'lucide-react';

export default function PageList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    pagesApi.list().then((res) => {
      setRows(res.data.data);
      setIsLoading(false);
    });
  }, []);

  const columns = [
    { key: 'title_en', label: t('pages.page') },
    { key: 'slug', label: t('pages.slug'), render: (row) => <code>{row.slug}</code> },
    { key: 'updated_at', label: t('pages.lastUpdated'), render: (row) => new Date(row.updated_at).toLocaleString() },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/pages/${row.slug}`)}>
            <Pencil size={14} /> {t('common.edit')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('pages.title')}</h1>
          <div className="subtitle">{t('pages.subtitle')}</div>
        </div>
      </div>
      <div className="surface-card">
        <DataTable columns={columns} rows={rows} isLoading={isLoading} />
      </div>
    </div>
  );
}
