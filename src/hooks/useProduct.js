/**
 * useProduct.js
 * 
 * Hook for retrieving a single product with authoritative availability.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchProductBySlug } from '../services/productService.js';
import { inventoryService } from '../services/inventoryService.js';

export function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const prod = await fetchProductBySlug(slug);
      if (!prod) {
        setError('Mahsulot topilmadi.');
        setProduct(null);
        return;
      }
      setProduct(prod);

      // Query customer-safe availability
      const avail = await inventoryService.getProductAvailability(prod.id || prod.slug);
      setAvailability(avail);
    } catch (err) {
      setError(err?.message || 'Mahsulot ma‘lumotlarini yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    product,
    availability,
    loading,
    error,
    refresh: load,
  };
}

export default useProduct;

