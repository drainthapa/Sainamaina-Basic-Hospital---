import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { newsApi } from '../../api/modules';
import { useListData } from '../../hooks/useListData';
import { useConfirm } from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import Toolbar from '../../components/Toolbar';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import { Pencil, Trash2 } from 'lucide-react';
import './News.css';

const MODULE_TYPES = ['news', 'notice', 'press_release', 'tender_notice', 'health_article', 'event'];
const STATUS_TONE = { published: 'success', draft: 'neutral', archived: 'warning' };

export default function NewsList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(newsApi.list, {
    limit: 20, offset: 0, module_type: 'news',
  });

  const handleDelete = async (row) => {
    const ok = await confirm(t('news.deleteConfirm', { name: row.title_en }));
    if (!ok) return;
    try {
      await newsApi.remove(row.id);
      toast.success(t('news.deleted'));
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
    { key: 'bs_date', label: t('news.bsDate'), render: (row) => row.bs_date || <span className="cell-muted">—</span> },
    { key: 'ad_date', label: t('news.adDate'), render: (row) => new Date(row.ad_date).toLocaleDateString() },
    {
      key: 'status', label: t('common.status'),
      render: (row) => <Badge tone={STATUS_TONE[row.status] || 'neutral'}>{t(`common.${row.status}`) || row.status}</Badge>,
    },
    { key: 'views', label: t('news.views') },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/news/${row.id}`)}>
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
          <h1>{t('news.title')}</h1>
          <div className="subtitle">{t('news.subtitle')}</div>
        </div>
      </div>

      <div className="news-tabs">
        {MODULE_TYPES.map((tabValue) => (
          <button
            key={tabValue}
            type="button"
            className={`news-tab ${tabValue === params.module_type ? 'active' : ''}`}
            onClick={() => setParams((p) => ({ ...p, module_type: tabValue, offset: 0 }))}
          >
            {t(`news.tabs.${tabValue}`)}
          </button>
        ))}
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('news.searchPlaceholder')}
        filters={(
          <select
            className="toolbar-filter-select"
            value={params.status || ''}
            onChange={(e) => setParams((p) => ({ ...p, status: e.target.value || undefined, offset: 0 }))}
          >
            <option value="">{t('common.allStatuses')}</option>
            <option value="published">{t('common.published')}</option>
            <option value="draft">{t('common.draft')}</option>
            <option value="archived">{t('common.archived')}</option>
          </select>
        )}
        onCreate={() => navigate(`/news/new?module_type=${params.module_type}`)}
        createLabel={`${t('common.new')} ${t(`news.tabs.${params.module_type}`)}`}
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
