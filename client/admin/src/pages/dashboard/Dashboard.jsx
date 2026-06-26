import { useEffect, useState } from 'react';
import { Building2, Stethoscope, Newspaper, FolderDown, Images } from 'lucide-react';
import { departmentsApi, staffApi, newsApi, downloadsApi, galleryApi } from '../../api/modules';
import './Dashboard.css';

const STAT_CARDS = [
  { key: 'departments', label: 'Departments', icon: Building2, fetch: () => departmentsApi.list({ limit: 1 }) },
  { key: 'staff', label: 'Staff & doctors', icon: Stethoscope, fetch: () => staffApi.list({ limit: 1 }) },
  { key: 'news', label: 'News & notices', icon: Newspaper, fetch: () => newsApi.list({ limit: 1 }) },
  { key: 'downloads', label: 'Documents', icon: FolderDown, fetch: () => downloadsApi.list({ limit: 1 }) },
  { key: 'gallery', label: 'Gallery albums', icon: Images, fetch: () => galleryApi.listAlbums({ limit: 1 }) },
];

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled(STAT_CARDS.map((card) => card.fetch())).then((results) => {
      const next = {};
      results.forEach((result, i) => {
        next[STAT_CARDS[i].key] = result.status === 'fulfilled' ? result.value.data.meta?.total ?? 0 : '—';
      });
      setCounts(next);
      setIsLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="subtitle">Overview of your hospital portal content</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="surface-card dashboard-stat">
            <div className="dashboard-stat-icon">
              <Icon size={20} />
            </div>
            <div>
              <div className="dashboard-stat-value">{isLoading ? '…' : counts[key]}</div>
              <div className="dashboard-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="surface-card dashboard-welcome">
        <h2>Welcome to the CMS</h2>
        <p>
          Use the sidebar to manage departments, staff and doctors, news and notices, downloadable
          documents, the photo and video gallery, static pages, and FAQs. Changes you publish here
          appear on the public website immediately.
        </p>
      </div>
    </div>
  );
}
