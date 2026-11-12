/**
 * pricingService.js
 * 
 * Authoritative price retrieval service connecting directly to StoneX ERP.
 * 
 * CORE ARCHITECTURAL RULE:
 * StoneX ERP is the sole authoritative source of truth for product prices.
 * The promotional website and Order Calculator must always query this service
 * for valid prices, avoiding separate conflicting price databases.
 */

import { erpApi } from './erpApi.js';
import { ERP_ENDPOINTS, IS_ERP_CONFIGURED, PRICE_CACHE_TTL_MS } from '../config/apiConfig.js';
import { adaptErpPrice } from '../adapters/priceAdapter.js';
import { products as localProducts } from '../data/products.js';

// Short-term in-memory cache to prevent flood requests during rapid UI navigation
const priceCache = new Map();

export const pricingService = {
  /**
   * Retrieves the authoritative price for a product.
   */
  async getAuthoritativePrice(productId, requestedUnit = null) {
    if (!productId) {
      return {
        price: null,
        priceUnit: 'm2',
        formatted: 'Narx so‘rov asosida',
        isAuthoritative: false,
        error: 'Mahsulot identifikatori ko‘rsatilmadi.',
      };
    }

    const cacheKey = `${productId}:${requestedUnit || 'default'}`;
    const cached = priceCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < PRICE_CACHE_TTL_MS) {
      return cached.data;
    }

    // If ERP is configured, query ERP pricing endpoint
    if (IS_ERP_CONFIGURED) {
      const endpoint = ERP_ENDPOINTS.PRODUCT_PRICING(productId);
      const { data, error } = await erpApi.get(endpoint);

      if (!error && data) {
        const adapted = adaptErpPrice(data);
        const result = {
          ...adapted,
          isAuthoritative: true,
          error: null,
          source: 'stonex_erp',
        };
        priceCache.set(cacheKey, { timestamp: now, data: result });
        return result;
      }
    }

    // Fallback: Use local product definition when ERP is not connected
    const local = localProducts.find((p) => p.id === productId || p.slug === productId);
    const adapted = adaptErpPrice(local || null);

    const result = {
      ...adapted,
      isAuthoritative: false,
      error: null,
      source: 'local_fallback',
    };

    priceCache.set(cacheKey, { timestamp: now, data: result });
    return result;
  },

  /**
   * Invalidates cached prices, for instance after an admin price update.
   */
  clearPriceCache(productId = null) {
    if (productId) {
      for (const key of priceCache.keys()) {
        if (key.startsWith(`${productId}:`)) {
          priceCache.delete(key);
        }
      }
    } else {
      priceCache.clear();
    }
  },
};

export default pricingService;

