import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { servicesApi } from '../../api/modules';
import { useListData } from '../../hooks/useListData';
import { useConfirm } from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import Toolbar from '../../components/Toolbar';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import { Pencil, Trash2 } from 'lucide-react';

export default function ServiceList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(servicesApi.list, {
    limit: 20, offset: 0,
  });

  const handleDelete = async (row) => {
    const ok = await confirm(t('services.deleteConfirm', { name: row.name_en }));
    if (!ok) return;
    try {
      await servicesApi.remove(row.id);
      toast.success(t('services.deleted'));
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.deleteFailed'));
    }
  };

  const filteredRows = search
    ? rows.filter((r) => r.name_en.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const columns = [
    { key: 'name_en', label: t('common.nameEn') },
    { key: 'name_np', label: t('common.nameNp') },
    { key: 'department_name_en', label: t('services.department'), render: (row) => row.department_name_en || <span className="cell-muted">—</span> },
    { key: 'is_emergency', label: t('services.emergency'), render: (row) => row.is_emergency && <Badge tone="danger">{t('services.emergency')}</Badge> },
    {
      key: 'is_published', label: t('common.status'),
      render: (row) => <Badge tone={row.is_published ? 'success' : 'neutral'}>{row.is_published ? t('common.published') : t('common.draft')}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/services/${row.id}`)}>
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
          <h1>{t('services.title')}</h1>
          <div className="subtitle">{t('services.subtitle')}</div>
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('services.searchPlaceholder')}
        onCreate={() => navigate('/services/new')}
        createLabel={t('services.newService')}
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
