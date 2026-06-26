import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { departmentsApi } from '../../api/modules';
import { useListData } from '../../hooks/useListData';
import { useConfirm } from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import Toolbar from '../../components/Toolbar';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import { Pencil, Trash2 } from 'lucide-react';

export default function DepartmentList() {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(departmentsApi.list, {
    limit: 20, offset: 0,
  });

  const handleDelete = async (row) => {
    const ok = await confirm(`Delete department "${row.name_en}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await departmentsApi.remove(row.id);
      toast.success('Department deleted');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredRows = search
    ? rows.filter((r) => r.name_en.toLowerCase().includes(search.toLowerCase()) || r.name_np.includes(search))
    : rows;

  const columns = [
    {
      key: 'image_url', label: '', width: '56px',
      render: (row) => (row.image_url
        ? <img className="cell-thumb" src={`${import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000'}${row.image_url}`} alt="" />
        : <div className="cell-thumb" />),
    },
    { key: 'name_en', label: 'Name (English)' },
    { key: 'name_np', label: 'Name (Nepali)' },
    {
      key: 'is_published', label: 'Status',
      render: (row) => <Badge tone={row.is_published ? 'success' : 'neutral'}>{row.is_published ? 'Published' : 'Draft'}</Badge>,
    },
    { key: 'sort_order', label: 'Order' },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/departments/${row.id}`)}>
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
          <h1>Departments</h1>
          <div className="subtitle">Manage hospital departments shown on the public site</div>
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments…"
        onCreate={() => navigate('/departments/new')}
        createLabel="New department"
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
