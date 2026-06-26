import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { galleryApi } from '../../api/modules';
import { useListData } from '../../hooks/useListData';
import { useConfirm } from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import Toolbar from '../../components/Toolbar';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import { Pencil, Trash2 } from 'lucide-react';

const FILE_BASE = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';

export default function GalleryList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(galleryApi.listAlbums, {
    limit: 20, offset: 0,
  });

  const handleDelete = async (row) => {
    const ok = await confirm(t('gallery.deleteConfirm', { name: row.title_en }));
    if (!ok) return;
    try {
      await galleryApi.removeAlbum(row.id);
      toast.success(t('gallery.deleted'));
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.deleteFailed'));
    }
  };

  const filteredRows = search
    ? rows.filter((r) => r.title_en.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const columns = [
    {
      key: 'cover_image_url', label: '', width: '56px',
      render: (row) => (row.cover_image_url
        ? <img className="cell-thumb" src={`${FILE_BASE}${row.cover_image_url}`} alt="" />
        : <div className="cell-thumb" />),
    },
    { key: 'title_en', label: t('common.titleEn') },
    { key: 'album_type', label: t('gallery.albumType'), render: (row) => <Badge tone="neutral">{row.album_type === 'photo' ? t('gallery.photo') : t('gallery.video')}</Badge> },
    { key: 'media_count', label: t('gallery.items') },
    {
      key: 'is_published', label: t('common.status'),
      render: (row) => <Badge tone={row.is_published ? 'success' : 'neutral'}>{row.is_published ? t('common.published') : t('common.draft')}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/gallery/${row.id}`)}>
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
          <h1>{t('gallery.title')}</h1>
          <div className="subtitle">{t('gallery.subtitle')}</div>
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('gallery.searchPlaceholder')}
        filters={(
          <select
            className="toolbar-filter-select"
            value={params.album_type || ''}
            onChange={(e) => setParams((p) => ({ ...p, album_type: e.target.value || undefined, offset: 0 }))}
          >
            <option value="">{t('common.allTypes')}</option>
            <option value="photo">{t('gallery.photo')}</option>
            <option value="video">{t('gallery.video')}</option>
          </select>
        )}
        onCreate={() => navigate('/gallery/new')}
        createLabel={t('gallery.newAlbum')}
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
