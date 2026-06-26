import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Building2, Stethoscope, Newspaper, FolderDown, Images, Plus,
  FileText, UserPlus, Clock,
} from 'lucide-react';
import {
  departmentsApi, staffApi, newsApi, downloadsApi, galleryApi, auditLogsApi,
} from '../../api/modules';
import './Dashboard.css';

const STAT_CARDS = [
  { key: 'departments', labelKey: 'dashboard.departments', icon: Building2, fetch: () => departmentsApi.list({ limit: 1 }), to: '/departments' },
  { key: 'staff', labelKey: 'dashboard.staff', icon: Stethoscope, fetch: () => staffApi.list({ limit: 1 }), to: '/staff' },
  { key: 'news', labelKey: 'dashboard.news', icon: Newspaper, fetch: () => newsApi.list({ limit: 1 }), to: '/news' },
  { key: 'downloads', labelKey: 'dashboard.documents', icon: FolderDown, fetch: () => downloadsApi.list({ limit: 1 }), to: '/downloads' },
  { key: 'gallery', labelKey: 'dashboard.galleryAlbums', icon: Images, fetch: () => galleryApi.listAlbums({ limit: 1 }), to: '/gallery' },
];

const NEWS_MODULE_TYPES = ['news', 'notice', 'press_release', 'tender_notice', 'health_article', 'event'];

const PIE_COLORS = ['#1d6f5c', '#dfe2e7'];

const ACTION_ICONS = { create: Plus, update: FileText, delete: Clock, login: UserPlus };

function timeAgo(dateStr, t) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return t('dashboard.justNow');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [newsByType, setNewsByType] = useState([]);
  const [publishStats, setPublishStats] = useState({ published: 0, draft: 0 });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    Promise.allSettled(STAT_CARDS.map((card) => card.fetch())).then((results) => {
      const next = {};
      results.forEach((result, i) => {
        next[STAT_CARDS[i].key] = result.status === 'fulfilled' ? result.value.data.meta?.total ?? 0 : '—';
      });
      setCounts(next);
      setIsLoading(false);
    });

    Promise.all(
      NEWS_MODULE_TYPES.map((type) => newsApi.list({ module_type: type, limit: 1 }))
    ).then((results) => {
      setNewsByType(
        NEWS_MODULE_TYPES.map((type, i) => ({
          name: t(`news.tabs.${type}`),
          count: results[i].data.meta?.total ?? 0,
        }))
      );
    }).catch(() => {});

    Promise.all([
      newsApi.list({ status: 'published', limit: 1 }),
      newsApi.list({ status: 'draft', limit: 1 }),
    ]).then(([pub, draft]) => {
      setPublishStats({
        published: pub.data.meta?.total ?? 0,
        draft: draft.data.meta?.total ?? 0,
      });
    }).catch(() => {});

    auditLogsApi.list({ limit: 8 }).then((res) => setActivity(res.data.data)).catch(() => {});
  }, [t]);

  const pieData = [
    { name: t('common.published'), value: publishStats.published },
    { name: t('common.draft'), value: publishStats.draft },
  ];
  const hasPieData = publishStats.published + publishStats.draft > 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <div className="subtitle">{t('dashboard.subtitle')}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {STAT_CARDS.map(({ key, labelKey, icon: Icon, to }, i) => (
          <button type="button" key={key} className="dashboard-stat" onClick={() => navigate(to)} style={{ '--accent-index': i }}>
            <div className="dashboard-stat-icon">
              <Icon size={20} />
            </div>
            <div>
              <div className="dashboard-stat-value">{isLoading ? '…' : counts[key]}</div>
              <div className="dashboard-stat-label">{t(labelKey)}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="dashboard-charts-row">
        <div className="surface-card dashboard-chart-card">
          <h3>{t('dashboard.contentByType')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={newsByType} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f2" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1d6f5c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card dashboard-chart-card dashboard-chart-card-small">
          <h3>{t('dashboard.publishedVsDraft')}</h3>
          {hasPieData ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-chart-empty">{t('common.noRecordsFound')}</div>
          )}
        </div>
      </div>

      <div className="dashboard-bottom-row">
        <div className="surface-card dashboard-activity-card">
          <h3>{t('dashboard.recentActivity')}</h3>
          {activity.length === 0 ? (
            <div className="dashboard-chart-empty">{t('dashboard.noActivityYet')}</div>
          ) : (
            <ul className="dashboard-activity-list">
              {activity.map((item) => {
                const Icon = ACTION_ICONS[item.action] || FileText;
                return (
                  <li key={item.id}>
                    <span className="dashboard-activity-icon"><Icon size={14} /></span>
                    <span className="dashboard-activity-text">
                      <strong>{item.user_name || 'System'}</strong> {item.action.replace(/_/g, ' ')}
                      {item.entity_type && <> {item.entity_type.replace(/_/g, ' ')}</>}
                    </span>
                    <span className="dashboard-activity-time">{timeAgo(item.created_at, t)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="surface-card dashboard-quick-actions-card">
          <h3>{t('dashboard.quickActions')}</h3>
          <div className="dashboard-quick-actions">
            <button type="button" onClick={() => navigate('/departments/new')}>
              <Building2 size={16} /> {t('dashboard.addDepartment')}
            </button>
            <button type="button" onClick={() => navigate('/staff/new')}>
              <Stethoscope size={16} /> {t('dashboard.addStaff')}
            </button>
            <button type="button" onClick={() => navigate('/news/new')}>
              <Newspaper size={16} /> {t('dashboard.addNews')}
            </button>
            <button type="button" onClick={() => navigate('/downloads/new')}>
              <FolderDown size={16} /> {t('dashboard.addDownload')}
            </button>
          </div>
        </div>
      </div>

      <div className="surface-card dashboard-welcome">
        <h2>{t('app.welcome')}</h2>
        <p>{t('app.welcomeBody')}</p>
      </div>
    </div>
  );
}
