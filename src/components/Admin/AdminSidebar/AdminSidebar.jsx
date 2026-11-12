import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth.js';
import useLanguage from '../../../hooks/useLanguage';
import './AdminSidebar.css';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Mahsulotlar', icon: Package },
  { to: '/admin/categories', label: 'Kategoriyalar', icon: FolderTree },
  { to: '/admin/discounts', label: 'Chegirmalar', icon: Tag },
  { to: '/admin/settings', label: 'Sozlamalar', icon: Settings },
];

export default function AdminSidebar({ isMobileOpen, onCloseMobile }) {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      {isMobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar${isCollapsed ? ' is-collapsed' : ''}${isMobileOpen ? ' is-mobile-open' : ''}`}
        aria-label="Admin navigatsiyasi"
      >
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={20} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} aria-hidden="true" />
            <span className="admin-sidebar-brand">{t('brand.short')} / ADMIN</span>
          </div>

          <button
            type="button"
            className="admin-sidebar-collapse-btn"
            onClick={() => setIsCollapsed(prev => !prev)}
            aria-label={isCollapsed ? 'Sidebar kengaytirish' : 'Sidebar kichraytirish'}
            title={isCollapsed ? 'Kengaytirish' : 'Kichraytirish'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) => `admin-nav-item${isActive ? ' is-active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-item"
            title="Do‘kon saytini ko‘rish"
          >
            <ExternalLink size={18} aria-hidden="true" />
            <span>Saytni ko\u02BBrish</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="admin-sidebar-logout-btn"
            title="Tizimdan chiqish"
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Tizimdan chiqish</span>
          </button>
        </div>
      </aside>
    </>
  );
}

