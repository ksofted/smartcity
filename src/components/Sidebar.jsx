import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, AlertTriangle, FileText,
  Users, Shield, Bell, Settings, Radio, GraduationCap
} from 'lucide-react';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/' },
  { label: 'Live Map', icon: MapPin, path: '/map' },
  { label: 'Incidents', icon: AlertTriangle, path: '/incidents', badge: 3 },
  { label: 'Reports', icon: FileText, path: '/reports', badge: 2 },
  { label: 'Geofences', icon: Shield, path: '/geofences' },
  { label: 'Schools', icon: GraduationCap, path: '/schools' },
  { label: 'Users', icon: Users, path: '/users' },
  { label: 'Alerts', icon: Bell, path: '/alerts', badge: 2 },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛡️</div>
        <div>
          <h2>CityAlert</h2>
          <span>Security Command</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {navItems.map(({ label, icon: Icon, path, badge }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
            {badge && <span className="badge">{badge}</span>}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 12 }}>System</div>
        <div className="nav-item">
          <Radio size={16} />
          Live Feed
          <span className="live-dot" style={{ marginLeft: 'auto', width: 8, height: 8, background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
        </div>
        <div className="nav-item">
          <Settings size={16} />
          Settings
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item">
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Admin</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Super Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
