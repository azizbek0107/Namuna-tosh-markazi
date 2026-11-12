import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useProductData from './useProductData';
import { useCurrentTime } from './useCountdown';
import { categories as fallbackCategories } from '../data/categories';
import { categoryService } from '../services/categoryService';
import { filterDiscounts, getActiveDiscounts, getDiscountStatus } from '../utils/discountUtils';
import { productCategories } from '../utils/catalogUtils';

export const discountSortOptions = [
  ['recommended', 'Tavsiya etilgan'],
  ['largest', 'Eng katta chegirma (%)'],
  ['ending', 'Tez orada tugaydigan']
];

export default function useDiscounts() {
  const { data: products, loading, error } = useProductData();
  const [params, setParams] = useSearchParams();
  const now = useCurrentTime(products.length > 0);
  const [dynamicCategories, setDynamicCategories] = useState(fallbackCategories);

  useEffect(() => {
    let isMounted = true;
    async function syncCategories() {
      try {
        const list = await categoryService.fetchCategories();
        if (isMounted && Array.isArray(list)) {
          const clean = list.filter(c => c.id !== 'all' && (c.isVisible ?? c.is_visible ?? true));
          setDynamicCategories([{ id: 'all', name: 'Barcha mahsulotlar' }, ...clean]);
        }
      } catch {}
    }
    syncCategories();

    const handleUpdate = () => syncCategories();
    if (typeof window !== 'undefined') {
      window.addEventListener('namuna:categories-updated', handleUpdate);
    }
    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('namuna:categories-updated', handleUpdate);
      }
    };
  }, []);

  const filters = useMemo(() => ({
    category: params.get('category') ?? 'all',
    type: params.get('type') ?? 'all',
    sort: discountSortOptions.some(([key]) => key === params.get('sort')) ? params.get('sort') : 'recommended'
  }), [params]);

  const active = useMemo(() => getActiveDiscounts(products, now), [products, now]);
  const previousActive = useRef([]);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (previousActive.current.some(product => getDiscountStatus(product, now) === 'expired')) {
      setAnnouncement('Aksiya yakunlandi. Muddati tugagan takliflar ro‘yxatdan olindi.');
    }
    previousActive.current = active;
  }, [active, now]);

  const results = useMemo(() => filterDiscounts(active, filters, now), [active, filters, now]);

  const categoryOptions = dynamicCategories.map(category => ({
    ...category,
    count: active.filter(product => category.id === 'all' || productCategories(product).includes(category.id) || productCategories(product).includes(category.slug)).length
  }));

  function update(key, value) {
    setParams(current => {
      const next = new URLSearchParams(current);
      if (value === 'all' || value === 'recommended') next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true, preventScrollReset: true });
  }

  return {
    filters,
    update,
    clear: () => setParams({}, { replace: true, preventScrollReset: true }),
    results,
    activeCount: active.length,
    categoryOptions,
    now,
    loading,
    error,
    announcement
  };
}
