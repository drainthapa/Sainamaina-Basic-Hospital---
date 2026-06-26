import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { downloadsApi } from '../../api/modules';
import { useListData } from '../../hooks/useListData';
import { useConfirm } from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import Toolbar from '../../components/Toolbar';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import { Pencil, Trash2, Download } from 'lucide-react';

const DOC_TYPE_LABELS = {
  act: 'Acts', policy: 'Policies', guideline: 'Guidelines', form: 'Forms',
  action_plan: 'Action plan', budget_program: 'Budget & program', annual_report: 'Annual reports',
  other_report: 'Other reports', publication: 'Publications', citizen_charter: 'Citizen charter',
  unicode_download: 'Unicode downloads', other: 'Other',
};

const FILE_BASE = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';

export default function DownloadList() {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(downloadsApi.list, {
    limit: 20, offset: 0,
  });

  const handleDelete = async (row) => {
    const ok = await confirm(`Delete "${row.title_en}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await downloadsApi.remove(row.id);
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
    { key: 'doc_type', label: 'Type', render: (row) => DOC_TYPE_LABELS[row.doc_type] || row.doc_type },
    { key: 'bs_date', label: 'BS date', render: (row) => row.bs_date || <span className="cell-muted">—</span> },
    { key: 'download_count', label: 'Downloads' },
    {
      key: 'file', label: 'File',
      render: (row) => row.file_url
        ? <a href={`${FILE_BASE}${row.file_url}`} target="_blank" rel="noreferrer"><Download size={14} /></a>
        : <span className="cell-muted">—</span>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/downloads/${row.id}`)}>
            <Pencil size={14} /> Edit
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
          <h1>Downloads</h1>
          <div className="subtitle">Covers acts, policies, guidelines, forms, budgets, reports, publications, and citizen charter</div>
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title…"
        filters={(
          <select
            className="toolbar-filter-select"
            value={params.doc_type || ''}
            onChange={(e) => setParams((p) => ({ ...p, doc_type: e.target.value || undefined, offset: 0 }))}
          >
            <option value="">All types</option>
            {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}
        onCreate={() => navigate('/downloads/new')}
        createLabel="New document"
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
