import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Building2, Stethoscope, Newspaper, FolderDown,
  Images, FileText, HelpCircle, Settings, Users, LogOut, HeartPulse,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from '../components/LanguageToggle';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/departments', labelKey: 'nav.departments', icon: Building2 },
  { to: '/services', labelKey: 'nav.services', icon: HeartPulse },
  { to: '/staff', labelKey: 'nav.staff', icon: Stethoscope },
  { to: '/news', labelKey: 'nav.news', icon: Newspaper },
  { to: '/downloads', labelKey: 'nav.downloads', icon: FolderDown },
  { to: '/gallery', labelKey: 'nav.gallery', icon: Images },
  { to: '/pages', labelKey: 'nav.pages', icon: FileText },
  { to: '/faqs', labelKey: 'nav.faqs', icon: HelpCircle },
  { to: '/users', labelKey: 'nav.users', icon: Users, roles: ['super_admin'] },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings, roles: ['super_admin', 'hospital_administrator'] },
];

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-np">सैनामैना अस्पताल</span>
        <span className="sidebar-brand-sub">{t('app.title')}</span>
      </div>

      <div className="sidebar-lang-row">
        <LanguageToggle />
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.filter((item) => !item.roles || hasRole(...item.roles)).map(({ to, labelKey, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={17} />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.fullName}</div>
          <div className="sidebar-user-role">{user?.role?.replace(/_/g, ' ')}</div>
        </div>
        <button type="button" className="sidebar-logout" onClick={logout} aria-label={t('auth.logout')} title={t('auth.logout')}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
