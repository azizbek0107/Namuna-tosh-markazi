import { useState, useEffect } from 'react';
import { fetchAllAdminProducts } from '../services/productService.js';
import { categoryService } from '../services/categoryService.js';
import { discountService } from '../services/discountService.js';

export function useAdminStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    visibleProducts: 0,
    hiddenProducts: 0,
    activeDiscounts: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const [products, categories, discounts] = await Promise.all([
        fetchAllAdminProducts(),
        categoryService.fetchCategories(),
        discountService.fetchDiscounts(),
      ]);

      const prodList = Array.isArray(products) ? products : products.products || [];
      const catList = Array.isArray(categories) ? categories : [];
      const discList = Array.isArray(discounts) ? discounts : [];

      const total = prodList.length;
      const visible = prodList.filter(p => p.isVisible ?? p.is_active ?? true).length;
      const hidden = total - visible;
      const now = Date.now();

      // Calculate active discounts
      const activeDiscCount = discList.filter(d => {
        if (!d.isActive && !d.is_active) return false;
        const end = d.endDate || d.ends_at;
        const start = d.startDate || d.starts_at;
        if (end && new Date(end).getTime() < now) return false;
        if (start && new Date(start).getTime() > now) return false;
        return true;
      }).length;

      setStats({
        totalProducts: total,
        visibleProducts: visible,
        hiddenProducts: hidden,
        activeDiscounts: activeDiscCount,
        totalCategories: catList.length,
      });
    } catch (err) {
      setError(err?.message || 'Statistikani yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loading, error, reload: loadStats, refresh: loadStats };
}

export default useAdminStats;
