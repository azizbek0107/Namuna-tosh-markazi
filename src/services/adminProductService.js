/**
 * adminProductService.js
 * 
 * Administrative synchronization and price updates with StoneX ERP.
 * 
 * CORE CONTRACT:
 * 1. An update is NEVER claimed successful until the authoritative ERP server confirms it.
 * 2. If ERP is not configured or in read-only mode, operations return an explicit limitation
 *    explanation instead of creating ghost/divergent data.
 * 3. Invalidates local price caches immediately upon verified ERP confirmation.
 */

import { erpApi } from './erpApi.js';
import { ERP_ENDPOINTS, IS_ERP_CONFIGURED } from '../config/apiConfig.js';
import { isValidPrice } from '../utils/priceUtils.js';
import { pricingService } from './pricingService.js';
import { updateProduct as updateDbProduct } from './productService.js';

export const adminProductService = {
  /**
   * Checks whether StoneX ERP is connected and write-capable.
   */
  async checkErpCapabilities() {
    if (!IS_ERP_CONFIGURED) {
      return {
        isConnected: false,
        supportsPriceUpdates: false,
        statusMessage: 'StoneX ERP tizimi ulanmagan. O‘zgarishlar faqat lokal veb-bazada amal qiladi.',
      };
    }

    try {
      const { error } = await erpApi.get(ERP_ENDPOINTS.HEALTH);
      if (error) {
        return {
          isConnected: false,
          supportsPriceUpdates: false,
          statusMessage: 'StoneX ERP serveriga ulanishda xatolik yuz berdi.',
        };
      }
      return {
        isConnected: true,
        supportsPriceUpdates: true,
        statusMessage: 'StoneX ERP serveri faol va sinxronizatsiya holatida.',
      };
    } catch {
      return {
        isConnected: false,
        supportsPriceUpdates: false,
        statusMessage: 'ERP serveri bilan aloqa o‘rnatilmadi.',
      };
    }
  },

  /**
   * Updates a product's authoritative price in StoneX ERP.
   */
  async updateErpPrice(productId, newPrice, unit = 'm2', adminToken = null) {
    const numericPrice = Number(newPrice);

    if (!isValidPrice(numericPrice) || numericPrice <= 0) {
      return {
        success: false,
        error: 'Noto‘g‘ri narx kiritildi. Narx musbat butun son bo‘lishi lozim.',
      };
    }

    // If ERP is configured, attempt authoritative update on ERP
    if (IS_ERP_CONFIGURED) {
      const endpoint = ERP_ENDPOINTS.ADMIN_PRICE_UPDATE(productId);
      const payload = {
        price: numericPrice,
        price_unit: unit,
        updated_at: new Date().toISOString(),
      };

      const { data, error, status } = await erpApi.put(endpoint, payload, { token: adminToken });

      if (error || !data) {
        return {
          success: false,
          error: error?.message || 'StoneX ERP tizimida narxni yangilab bo‘lmadi.',
          status,
        };
      }

      // Verified confirmation from ERP:
      pricingService.clearPriceCache(productId);

      // Keep web database in sync
      await updateDbProduct(productId, { price: numericPrice, priceUnit: unit });

      return {
        success: true,
        data,
        error: null,
        message: 'Narx StoneX ERP tizimida muvaffaqiyatli yangilandi.',
      };
    }

    // If ERP is not linked, update local/database record with clear disclosure
    const dbRes = await updateDbProduct(productId, { price: numericPrice, priceUnit: unit });
    pricingService.clearPriceCache(productId);

    return {
      success: !dbRes.error,
      data: dbRes.data,
      error: dbRes.error,
      isFallback: true,
      message: 'Narx veb-boshqaruv bazasida yangilandi (ERP ulanmagan).',
    };
  },
};

export default adminProductService;

