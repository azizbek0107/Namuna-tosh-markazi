import { Package, Eye, EyeOff, Tag, FolderTree } from 'lucide-react';
import useAdminStats from '../../../hooks/useAdminStats.js';
import './DashboardStats.css';

export default function DashboardStats() {
  const { stats, loading } = useAdminStats();

  const items = [
    {
      title: 'Jami mahsulotlar',
      value: loading ? '—' : stats.totalProducts,
      hint: 'Katalogdagi jami mahsulotlar',
      icon: Package,
    },
    {
      title: 'Faol (ko‘rinadigan)',
      value: loading ? '—' : stats.visibleProducts,
      hint: 'Mijozlar ko‘ra oladigan',
      icon: Eye,
    },
    {
      title: 'Yashirin mahsulotlar',
      value: loading ? '—' : stats.hiddenProducts,
      hint: 'Qoralamadagi yoki o‘chirilgan',
      icon: EyeOff,
    },
    {
      title: 'Faol aksiyalar',
      value: loading ? '—' : stats.activeDiscounts,
      hint: 'Ayni vaqtda amaldagi',
      icon: Tag,
    },
    {
      title: 'Kategoriyalar',
      value: loading ? '—' : stats.totalCategories,
      hint: 'Mahsulot yo‘nalishlari',
      icon: FolderTree,
    },
  ];

  return (
    <div className="stats-grid" aria-label="Statistika ko‘rsatkichlari">
      {items.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">{stat.title}</span>
              <div className="stat-card-icon">
                <Icon size={16} aria-hidden="true" />
              </div>
            </div>
            <p className="stat-card-value">{stat.value}</p>
            <p className="stat-card-hint">{stat.hint}</p>
          </div>
        );
      })}
    </div>
  );
}

