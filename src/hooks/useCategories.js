/**
 * useCategories.js
 * 
 * Hook for retrieving the synchronized stone product categories.
 */

import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService.js';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.fetchCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Kategoriyalarni yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    categories,
    loading,
    error,
    refresh: load,
  };
}

export default useCategories;

