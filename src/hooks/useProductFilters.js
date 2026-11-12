import { useState, useEffect, useMemo } from 'react';
import useLanguage from './useLanguage';
import { useSearchParams } from 'react-router-dom';
import { categories as fallbackCategories } from '../data/categories';
import { categoryService } from '../services/categoryService';
import { filterProducts, sortProducts, sizeKey, formatSize } from '../utils/catalogUtils';
import { getPriceInfo } from '../utils/priceUtils';
import { useCurrentTime } from './useCountdown';

export const sortOptions = [
  ['recommended', 'Tavsiya etilgan'], ['name-asc', 'Nomi: A–Z'], ['name-desc', 'Nomi: Z–A'],
  ['price-asc', 'Narx: arzondan qimmatga'], ['price-desc', 'Narx: qimmatdan arzonga'], ['newest', 'Yangilari birinchi'],
];

function getCleanInitialCategories() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem('namuna_categories_store');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length >= fallbackCategories.length) {
          const valid = parsed.filter(c => c.id !== 'all');
          return [{ id: 'all', name: 'Barcha mahsulotlar' }, ...valid];
        }
      }
    } catch {}
  }
  return fallbackCategories;
}

export default function useProductFilters(products) {
  const { t } = useLanguage();
  const now = useCurrentTime(products.length > 0);
  const [params, setParams] = useSearchParams();
  const [dynamicCategories, setDynamicCategories] = useState(getCleanInitialCategories);

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

    const handleUpdate = () => {
      syncCategories();
    };

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
    query: params.get('q') ?? '',
    category: params.get('category') ?? 'all',
    size: params.get('size') ?? 'all',
    min: params.get('min') ?? '',
    max: params.get('max') ?? '',
    discounted: params.get('discounted') === '1',
    includeUnpriced: params.get('unpriced') !== '0',
    sort: sortOptions.some(([id]) => id === params.get('sort')) ? params.get('sort') : 'recommended'
  }), [params]);

  const rangeError = [filters.min, filters.max].some(value => value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0))
    ? t('catalog.price_invalid')
    : filters.min !== '' && filters.max !== '' && Number(filters.min) > Number(filters.max)
    ? t('catalog.range_invalid')
    : '';

  const results = useMemo(() => rangeError ? [] : sortProducts(filterProducts(products, filters, now), filters.sort, now), [products, filters, rangeError, now]);

  const sizeOptions = useMemo(() => [...new Map(products.flatMap(product => product.sizes ?? []).map(size => [sizeKey(size), { value: sizeKey(size), label: formatSize(size) }])).values()], [products]);

  function update(key, value) {
    const paramKey = { query: 'q', includeUnpriced: 'unpriced' }[key] ?? key;
    setParams(current => {
      const next = new URLSearchParams(current);
      const encoded = typeof value === 'boolean' ? (value ? '1' : '0') : value;
      if (encoded === '' || encoded === 'all' || encoded === 'recommended' || (key === 'discounted' && !value) || (key === 'includeUnpriced' && value)) next.delete(paramKey);
      else next.set(paramKey, encoded);
      return next;
    }, { replace: true, preventScrollReset: true });
  }

  const clear = () => setParams({}, { replace: true, preventScrollReset: true });
  const pricedCount = results.filter(product => getPriceInfo(product, now).isPriced).length;

  const categoryOptions = useMemo(() => {
    return dynamicCategories.map(category => ({
      ...category,
      count: products.filter(product => category.id === 'all' || [product.category, ...(product.categories ?? [])].includes(category.id) || [product.category, ...(product.categories ?? [])].includes(category.slug)).length
    }));
  }, [dynamicCategories, products]);

  return {
    now,
    filters,
    update,
    clear,
    results,
    sizeOptions,
    rangeError,
    pricedCount,
    unpricedCount: results.length - pricedCount,
    categoryOptions,
    activeCount: Number(filters.category !== 'all') + Number(filters.size !== 'all') + Number(filters.min !== '' || filters.max !== '') + Number(filters.discounted) + Number(!filters.includeUnpriced)
  };
}
