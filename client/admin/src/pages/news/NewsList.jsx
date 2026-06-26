import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const MODULE_TABS = [
  { value: 'news', label: 'News' },
  { value: 'notice', label: 'Notices' },
  { value: 'press_release', label: 'Press releases' },
  { value: 'tender_notice', label: 'Tender notices' },
  { value: 'health_article', label: 'Health awareness' },
  { value: 'event', label: 'Events' },
];

const STATUS_TONE = { published: 'success', draft: 'neutral', archived: 'warning' };

export default function NewsList() {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(newsApi.list, {
    limit: 20, offset: 0, module_type: 'news',
  });

  const handleDelete = async (row) => {
    const ok = await confirm(`Delete "${row.title_en}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await newsApi.remove(row.id);
      toast.success('Deleted');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredRows = search
    ? rows.filter((r) => r.title_en.toLowerCase().includes(search.toLowerCase()) || r.title_np.includes(search))
    : rows;

  const columns = [
    { key: 'title_en', label: 'Title' },
    { key: 'bs_date', label: 'BS date', render: (row) => row.bs_date || <span className="cell-muted">—</span> },
    { key: 'ad_date', label: 'AD date', render: (row) => new Date(row.ad_date).toLocaleDateString() },
    {
      key: 'status', label: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status] || 'neutral'}>{row.status}</Badge>,
    },
    { key: 'views', label: 'Views' },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/news/${row.id}`)}>
            <Pencil size={14} /> Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const currentTab = MODULE_TABS.find((t) => t.value === params.module_type);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>News & notices</h1>
          <div className="subtitle">Covers news, notices, press releases, tender notices, health awareness articles, and events</div>
        </div>
      </div>

      <div className="news-tabs">
        {MODULE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`news-tab ${tab.value === params.module_type ? 'active' : ''}`}
            onClick={() => setParams((p) => ({ ...p, module_type: tab.value, offset: 0 }))}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title…"
        filters={(
          <select
            className="toolbar-filter-select"
            value={params.status || ''}
            onChange={(e) => setParams((p) => ({ ...p, status: e.target.value || undefined, offset: 0 }))}
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        )}
        onCreate={() => navigate(`/news/new?module_type=${params.module_type}`)}
        createLabel={`New ${currentTab?.label.toLowerCase().replace(/s$/, '') || 'item'}`}
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
