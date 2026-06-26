import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pagesApi } from '../../api/modules';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import { Pencil } from 'lucide-react';

export default function PageList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    pagesApi.list().then((res) => {
      setRows(res.data.data);
      setIsLoading(false);
    });
  }, []);

  const columns = [
    { key: 'title_en', label: 'Page' },
    { key: 'slug', label: 'Slug', render: (row) => <code>{row.slug}</code> },
    { key: 'updated_at', label: 'Last updated', render: (row) => new Date(row.updated_at).toLocaleString() },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/pages/${row.slug}`)}>
            <Pencil size={14} /> Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pages</h1>
          <div className="subtitle">Static content: About, History, Mission, Vision, Organization Structure, Citizen Charter, Hospital Profile</div>
        </div>
      </div>
      <div className="surface-card">
        <DataTable columns={columns} rows={rows} isLoading={isLoading} />
      </div>
    </div>
  );
}
