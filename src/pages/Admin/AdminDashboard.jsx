import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  Tag,
  Settings,
  ShieldCheck,
  ArrowRight,
  Plus
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import useAuth from '../../hooks/useAuth.js';
import { useAdminStats } from '../../hooks/useAdminStats';
import DashboardStats from '../../components/Admin/DashboardStats/DashboardStats';
import LoadingState from '../../components/Admin/Shared/LoadingState';
import './AdminDashboard.css';

export default function AdminDashboard() {
  
  const { user } = useAuth();
  const { stats, loading, reload } = useAdminStats();
  const reduced = useReducedMotion();

  if (loading) {
    return <LoadingState message="Boshqaruv paneli yuklanmoqda..." />;
  }

  const modules = [
    {
      to: '/admin/products',
      title: 'Mahsulotlar katalogi',
      desc: 'Kerama granit, granit, kafel va boshqa tosh mahsulotlari katalogini to‘liq boshqarish, narxlar va o‘lchamlarni sozlash.',
      count: `${stats.totalProducts} ta mahsulot`,
      icon: Package,
      badge: 'KATALOG'
    },
    {
      to: '/admin/categories',
      title: 'Kategoriyalar',
      desc: 'Tosh mahsulotlari turlari, bo‘limlar va tasniflarni boshqarish.',
      count: `${stats.totalCategories} ta kategoriya`,
      icon: Layers,
      badge: 'GURUHLAR'
    },
    {
      to: '/admin/discounts',
      title: 'Chegirmalar va aksiyalar',
      desc: 'Mavsumiy chegirmalar, amal qilish muddatlari va mahsulot chegirmalarini sozlash.',
      count: `${stats.activeDiscounts} ta faol chegirma`,
      icon: Tag,
      badge: 'AKSIYALAR'
    },
    {
      to: '/admin/settings',
      title: 'Aloqa va sayt sozlamalari',
      desc: 'Telegram, telefon raqamlari, korxona manzili va ish vaqtini yangilash.',
      count: 'Sayt ma‘lumotlari',
      icon: Settings,
      badge: 'SOZLAMALAR'
    }
  ];

  return (
    <div className="admin-dash" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Top Welcome Header */}
      <div className="admin-dash-header" style={{ marginBottom: 0 }}>
        <div className="admin-dash-user">
          <span className="page-eyebrow">
            <span /> XAVFSIZ ADMIN MUHITI
          </span>
          <h1>Boshqaruv paneli</h1>
          <div className="admin-dash-email">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{user?.email || 'Administrator'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link
            to="/admin/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 600,
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))',
              color: '#0d0d0d',
              border: 'none',
              borderRadius: 2,
              textDecoration: 'none'
            }}
          >
            <Plus size={16} />
            <span>Mahsulot qo‘shish</span>
          </Link>
        </div>
      </div>

      {/* Pure Data-backed Statistics (Zero fake metrics) */}
      <DashboardStats stats={stats} />

      {/* Management Modules Grid */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
            Tezkor boshqaruv bo‘limlari
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Tizimning asosiy modullariga to‘g‘ridan-to‘g‘ri kirish
          </p>
        </div>

        <motion.div
          className="admin-dash-grid"
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        >
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.to} className="admin-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="admin-card-icon">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <span className="admin-card-badge">{m.badge}</span>
                </div>
                <h2>{m.title}</h2>
                <p>{m.desc}</p>
                <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-primary)' }}>
                    {m.count}
                  </span>
                  <Link
                    to={m.to}
                    className="text-link"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13 }}
                  >
                    <span>O‘tish</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
