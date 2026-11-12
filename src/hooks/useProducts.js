/**
 * useProducts.js
 * 
 * Hook for fetching and accessing the synchronized product catalog.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../services/productService.js';

export function useProducts(options = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Mahsulotlarni yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    products,
    loading,
    error,
    refresh: load,
  };
}

export default useProducts;

