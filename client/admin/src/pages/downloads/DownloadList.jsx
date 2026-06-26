import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { downloadsApi } from '../../api/modules';
import { useListData } from '../../hooks/useListData';
import { useConfirm } from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import Toolbar from '../../components/Toolbar';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import { Pencil, Trash2, Download } from 'lucide-react';

const DOC_TYPES = [
  'act', 'policy', 'guideline', 'form', 'action_plan', 'budget_program', 'annual_report',
  'other_report', 'publication', 'citizen_charter', 'unicode_download', 'other',
];

const FILE_BASE = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';

export default function DownloadList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(downloadsApi.list, {
    limit: 20, offset: 0,
  });

  const handleDelete = async (row) => {
    const ok = await confirm(t('downloads.deleteConfirm', { name: row.title_en }));
    if (!ok) return;
    try {
      await downloadsApi.remove(row.id);
      toast.success(t('downloads.deleted'));
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.deleteFailed'));
    }
  };

  const filteredRows = search
    ? rows.filter((r) => r.title_en.toLowerCase().includes(search.toLowerCase()) || r.title_np.includes(search))
    : rows;

  const columns = [
    { key: 'title_en', label: t('common.titleEn') },
    { key: 'doc_type', label: t('downloads.docType'), render: (row) => t(`downloads.types.${row.doc_type}`) || row.doc_type },
    { key: 'bs_date', label: t('downloads.bsDate'), render: (row) => row.bs_date || <span className="cell-muted">—</span> },
    { key: 'download_count', label: t('downloads.downloads') },
    {
      key: 'file', label: t('downloads.file'),
      render: (row) => row.file_url
        ? <a href={`${FILE_BASE}${row.file_url}`} target="_blank" rel="noreferrer"><Download size={14} /></a>
        : <span className="cell-muted">—</span>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/downloads/${row.id}`)}>
            <Pencil size={14} /> {t('common.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('downloads.title')}</h1>
          <div className="subtitle">{t('downloads.subtitle')}</div>
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('downloads.searchPlaceholder')}
        filters={(
          <select
            className="toolbar-filter-select"
            value={params.doc_type || ''}
            onChange={(e) => setParams((p) => ({ ...p, doc_type: e.target.value || undefined, offset: 0 }))}
          >
            <option value="">{t('common.allTypes')}</option>
            {DOC_TYPES.map((value) => (
              <option key={value} value={value}>{t(`downloads.types.${value}`)}</option>
            ))}
          </select>
        )}
        onCreate={() => navigate('/downloads/new')}
        createLabel={t('downloads.newDocument')}
      />

      <div className="surface-card">
        <DataTable columns={columns} rows={filteredRows} isLoading={isLoading} error={error} />
      </div>

      <Pagination
        total={total}
        limit={params.limit}
        offset={params.offset}
        onChange={(offset) => setParams((p) => ({ ...p, offset }))}
      />
      {dialog}
    </div>
  );
}
