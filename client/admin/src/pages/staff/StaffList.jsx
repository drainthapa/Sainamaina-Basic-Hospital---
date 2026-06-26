import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { staffApi } from '../../api/modules';
import { useListData } from '../../hooks/useListData';
import { useConfirm } from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import Toolbar from '../../components/Toolbar';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import { Pencil, Trash2 } from 'lucide-react';

const STAFF_TYPE_LABELS = {
  doctor: 'Doctor', nursing: 'Nursing', administrative: 'Administrative',
  technical: 'Technical', support: 'Support',
};

export default function StaffList() {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(staffApi.list, {
    limit: 20, offset: 0,
  });

  const handleDelete = async (row) => {
    const ok = await confirm(`Delete "${row.full_name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await staffApi.remove(row.id);
      toast.success('Staff member deleted');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredRows = search
    ? rows.filter((r) => r.full_name.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const columns = [
    {
      key: 'photo_url', label: '', width: '56px',
      render: (row) => (row.photo_url
        ? <img className="cell-thumb" src={`${import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000'}${row.photo_url}`} alt="" />
        : <div className="cell-thumb" />),
    },
    { key: 'full_name', label: 'Name' },
    { key: 'designation_en', label: 'Designation' },
    {
      key: 'staff_type', label: 'Type',
      render: (row) => <Badge tone="neutral">{STAFF_TYPE_LABELS[row.staff_type] || row.staff_type}</Badge>,
    },
    { key: 'department_name_en', label: 'Department', render: (row) => row.department_name_en || <span className="cell-muted">—</span> },
    {
      key: 'is_published', label: 'Status',
      render: (row) => <Badge tone={row.is_published ? 'success' : 'neutral'}>{row.is_published ? 'Published' : 'Draft'}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/staff/${row.id}`)}>
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
          <h1>Staff & doctors</h1>
          <div className="subtitle">Manage the staff directory shown on the public site</div>
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name…"
        filters={(
          <select
            className="toolbar-filter-select"
            value={params.staff_type || ''}
            onChange={(e) => setParams((p) => ({ ...p, staff_type: e.target.value || undefined, offset: 0 }))}
          >
            <option value="">All types</option>
            {Object.entries(STAFF_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}
        onCreate={() => navigate('/staff/new')}
        createLabel="New staff member"
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
