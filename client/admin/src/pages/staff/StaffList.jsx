import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const FILE_BASE = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';
const STAFF_TYPES = ['doctor', 'nursing', 'administrative', 'technical', 'support'];

const AVATAR_COLORS = [
  '#0956CE', '#0F6E56', '#7C3AED', '#B45309',
  '#0E7490', '#BE185D', '#15803D', '#9A3412',
];

function getInitials(name = '') {
  const HONORIFICS = /^(dr|mr|mrs|ms|prof|er|eng|adv)\.?$/i;
  const parts = name.trim().split(/\s+/).filter((w) => w && !HONORIFICS.test(w));
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function StaffAvatar({ row }) {
  if (row.photo_url) {
    return (
      <img
        className="cell-thumb"
        src={`${FILE_BASE}${row.photo_url}`}
        alt={row.full_name}
        style={{ borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  const initials = getInitials(row.full_name);
  const bg = avatarColor(row.full_name);
  return (
    <div
      className="cell-thumb"
      style={{
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.5px',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export default function StaffList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(staffApi.list, {
    limit: 20, offset: 0,
  });

  const handleDelete = async (row) => {
    const ok = await confirm(t('staff.deleteConfirm', { name: row.full_name }));
    if (!ok) return;
    try {
      await staffApi.remove(row.id);
      toast.success(t('staff.deleted'));
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.deleteFailed'));
    }
  };

  const filteredRows = search
    ? rows.filter((r) => r.full_name.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const columns = [
    {
      key: 'photo_url', label: '', width: '56px',
      render: (row) => <StaffAvatar row={row} />,
    },
    { key: 'full_name', label: t('staff.fullName') },
    { key: 'designation_en', label: t('staff.designationEn') },
    {
      key: 'staff_type', label: t('staff.staffType'),
      render: (row) => <Badge tone="neutral">{t(`staff.types.${row.staff_type}`)}</Badge>,
    },
    { key: 'department_name_en', label: t('staff.department'), render: (row) => row.department_name_en || <span className="cell-muted">—</span> },
    {
      key: 'is_published', label: t('common.status'),
      render: (row) => <Badge tone={row.is_published ? 'success' : 'neutral'}>{row.is_published ? t('common.published') : t('common.draft')}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/staff/${row.id}`)}>
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
          <h1>{t('staff.title')}</h1>
          <div className="subtitle">{t('staff.subtitle')}</div>
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('staff.searchPlaceholder')}
        filters={(
          <select
            className="toolbar-filter-select"
            value={params.staff_type || ''}
            onChange={(e) => setParams((p) => ({ ...p, staff_type: e.target.value || undefined, offset: 0 }))}
          >
            <option value="">{t('common.allTypes')}</option>
            {STAFF_TYPES.map((value) => (
              <option key={value} value={value}>{t(`staff.types.${value}`)}</option>
            ))}
          </select>
        )}
        onCreate={() => navigate('/staff/new')}
        createLabel={t('staff.newStaff')}
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
