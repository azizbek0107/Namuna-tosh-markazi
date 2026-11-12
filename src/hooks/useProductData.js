import { useEffect, useState } from 'react';
import { fetchProducts, fetchProductBySlug } from '../services/productService';

export default function useProductData(slug) {
  const [state, setState] = useState({ data: slug === undefined ? [] : null, loading: true, error: null });

  useEffect(() => {
    let isCancelled = false;

    function loadData() {
      const controller = new AbortController();
      const request = slug === undefined
        ? fetchProducts({ signal: controller.signal })
        : fetchProductBySlug(slug, { signal: controller.signal });

      request
        .then(data => {
          if (!isCancelled) setState({ data, loading: false, error: null });
        })
        .catch(error => {
          if (!isCancelled) setState({ data: slug === undefined ? [] : null, loading: false, error });
        });

      return () => controller.abort();
    }

    const abort = loadData();

    // Listen to real-time local sync events from admin panel updates
    const handleSync = () => {
      loadData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('namuna:products-updated', handleSync);
    }

    return () => {
      isCancelled = true;
      if (typeof abort === 'function') abort();
      if (typeof window !== 'undefined') {
        window.removeEventListener('namuna:products-updated', handleSync);
      }
    };
  }, [slug]);

  return state;
}
