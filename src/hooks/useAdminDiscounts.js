import { useState, useEffect, useCallback } from 'react';
import { discountService } from '../services/discountService.js';
import { fetchAllAdminProducts } from '../services/productService.js';

export function useAdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [discList, prodList] = await Promise.all([
        discountService.fetchDiscounts(),
        fetchAllAdminProducts(),
      ]);
      setDiscounts(discList);
      setProducts(Array.isArray(prodList) ? prodList : prodList?.products || []);
    } catch (err) {
      setError(err?.message || 'Chegirmalarni yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (payload) => {
    const result = await discountService.createDiscount(payload);
    if (!result.error) await loadData();
    return result;
  };

  const handleUpdate = async (id, payload) => {
    const result = await discountService.updateDiscount(id, payload);
    if (!result.error) await loadData();
    return result;
  };

  const handleDelete = async (idOrDiscount) => {
    const id = typeof idOrDiscount === 'object' ? idOrDiscount.id : idOrDiscount;
    const result = await discountService.deleteDiscount(id);
    if (result.success) {
      setDiscounts(prev => prev.filter(d => d.id !== id));
    }
    return result;
  };

  const handleToggle = async (idOrDiscount, currentActive) => {
    let id;
    let next;
    if (typeof idOrDiscount === 'object') {
      id = idOrDiscount.id;
      const curr = idOrDiscount.isActive ?? idOrDiscount.is_active;
      next = currentActive !== undefined ? currentActive : !curr;
    } else {
      id = idOrDiscount;
      next = !currentActive;
    }

    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, isActive: next, is_active: next } : d));
    const result = await discountService.toggleDiscount(id, next);
    if (result.error) {
      await loadData();
    }
    return result;
  };

  return {
    discounts,
    products,
    loading,
    error,
    refresh: loadData,
    reload: loadData,
    createDiscount: handleCreate,
    updateDiscount: handleUpdate,
    deleteDiscount: handleDelete,
    toggleDiscount: handleToggle,
  };
}

export default useAdminDiscounts;
