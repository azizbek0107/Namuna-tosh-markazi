/**
 * useProductPrice.js
 * 
 * Hook to retrieve and react to the live authoritative price from StoneX ERP.
 */

import { useState, useEffect, useCallback } from 'react';
import { pricingService } from '../services/pricingService.js';

export function useProductPrice(productId, requestedUnit = null) {
  const [pricing, setPricing] = useState({
    price: null,
    priceUnit: requestedUnit || 'm2',
    unitLabel: 'm²',
    formatted: 'Narx so‘rov asosida',
    isAuthoritative: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPrice = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await pricingService.getAuthoritativePrice(productId, requestedUnit);
      setPricing(res);
      if (res.error) setError(res.error);
    } catch (err) {
      setError(err?.message || 'Narxni olishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }, [productId, requestedUnit]);

  useEffect(() => {
    loadPrice();
  }, [loadPrice]);

  return {
    ...pricing,
    loading,
    error,
    refresh: loadPrice,
  };
}

export default useProductPrice;

