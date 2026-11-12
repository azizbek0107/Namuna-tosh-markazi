import React from 'react';
import { Menu, ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth.js';
import ThemeToggle from '../../ThemeToggle/ThemeToggle.jsx';
import './AdminHeader.css';

export default function AdminHeader({ title = 'Dashboard', onOpenMobile }) {
  const { user, logout } = useAuth();

  return (
    <header className="admin-header-bar">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={onOpenMobile}
          aria-label="Menyuni ochish"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span className="admin-header-title">{title}</span>
      </div>

      <div className="admin-header-right">
        {user?.email && (
          <div className="admin-header-email-badge">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>{user.email}</span>
          </div>
        )}

        <ThemeToggle />

        <Link
          to="/"
          className="text-link"
          style={{ fontSize: 12 }}
          title="Asosiy do‘kon saytiga qaytish"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Saytga qaytish
        </Link>

        <button
          type="button"
          onClick={logout}
          className="admin-header-logout"
          aria-label="Tizimdan chiqish"
        >
          <LogOut size={14} aria-hidden="true" />
          <span>Chiqish</span>
        </button>
      </div>
    </header>
  );
}
