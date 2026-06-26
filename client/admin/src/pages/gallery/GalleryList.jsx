import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { confirm, dialog } = useConfirm();
  const [search, setSearch] = useState('');
  const { rows, total, isLoading, error, params, setParams, reload } = useListData(galleryApi.listAlbums, {
    limit: 20, offset: 0,
  });

  const handleDelete = async (row) => {
    const ok = await confirm(`Delete album "${row.title_en}"? This will remove all its photos/videos.`);
    if (!ok) return;
    try {
      await galleryApi.removeAlbum(row.id);
      toast.success('Album deleted');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
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
    { key: 'title_en', label: 'Title' },
    { key: 'album_type', label: 'Type', render: (row) => <Badge tone="neutral">{row.album_type}</Badge> },
    { key: 'media_count', label: 'Items' },
    {
      key: 'is_published', label: 'Status',
      render: (row) => <Badge tone={row.is_published ? 'success' : 'neutral'}>{row.is_published ? 'Published' : 'Draft'}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/gallery/${row.id}`)}>
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
          <h1>Gallery</h1>
          <div className="subtitle">Photo and video albums</div>
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search albums…"
        filters={(
          <select
            className="toolbar-filter-select"
            value={params.album_type || ''}
            onChange={(e) => setParams((p) => ({ ...p, album_type: e.target.value || undefined, offset: 0 }))}
          >
            <option value="">All types</option>
            <option value="photo">Photo</option>
            <option value="video">Video</option>
          </select>
        )}
        onCreate={() => navigate('/gallery/new')}
        createLabel="New album"
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
