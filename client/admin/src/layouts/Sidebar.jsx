import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Stethoscope, Newspaper, FolderDown,
  Images, FileText, HelpCircle, Settings, Users, LogOut, HeartPulse,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/services', label: 'Hospital services', icon: HeartPulse },
  { to: '/staff', label: 'Staff & Doctors', icon: Stethoscope },
  { to: '/news', label: 'News & Notices', icon: Newspaper },
  { to: '/downloads', label: 'Downloads', icon: FolderDown },
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/pages', label: 'Pages', icon: FileText },
  { to: '/faqs', label: 'FAQs', icon: HelpCircle },
  { to: '/users', label: 'Users', icon: Users, roles: ['super_admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'hospital_administrator'] },
];

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-np">सैनामैना अस्पताल</span>
        <span className="sidebar-brand-sub">CMS Admin Panel</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.filter((item) => !item.roles || hasRole(...item.roles)).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.fullName}</div>
          <div className="sidebar-user-role">{user?.role?.replace(/_/g, ' ')}</div>
        </div>
        <button type="button" className="sidebar-logout" onClick={logout} aria-label="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
