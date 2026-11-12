import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import AdminSidebar from '../components/Admin/AdminSidebar/AdminSidebar';
import AdminHeader from '../components/Admin/AdminHeader/AdminHeader';
import useAuth from '../hooks/useAuth.js';
import useLanguage from '../hooks/useLanguage';
import '../styles/admin.css';
import './AdminLayout.css';

const authPaths = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password'
];

const pageTitles = {
  '/admin': 'Boshqaruv paneli',
  '/admin/products': 'Mahsulotlar',
  '/admin/categories': 'Kategoriyalar',
  '/admin/discounts': 'Chegirmalar',
  '/admin/settings': 'Sozlamalar'
};

export default function AdminLayout() {
  const { t } = useLanguage();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = authPaths.includes(location.pathname);

  // If on public admin auth routes or not yet authenticated, render the focused login shell
  if (isAuthPage || (!isAuthenticated && !loading)) {
    return (
      <div className="admin-layout">
        <a className="skip-link" href="#admin-content">
          Asosiy mazmunga o‘tish
        </a>
        <header className="admin-header container">
          <span>
            {t('brand.short')} <span className="gold-text">/ ADMIN</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ThemeToggle />
            <Link className="text-link" to="/">
              <ArrowLeft size={16} aria-hidden="true" /> Saytga qaytish
            </Link>
          </div>
        </header>
        <main id="admin-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    );
  }

  const currentTitle = pageTitles[location.pathname] || 'Admin panel';

  // Authenticated Dashboard Layout
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">
        Asosiy mazmunga o‘tish
      </a>

      <AdminSidebar
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="admin-main-wrapper">
        <AdminHeader
          title={currentTitle}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main id="admin-content" className="admin-main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
