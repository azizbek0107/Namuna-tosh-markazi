/**
 * inventoryService.js
 * 
 * Customer-safe stock availability service for StoneX ERP.
 * 
 * SECURITY SPECIFICATION:
 * Under NO circumstances should internal warehouse stock counts, kilograms,
 * cost valuation, pallets, supplier batches, or employee records be exposed to customers.
 * Only sanitized, binary/safe statuses are exposed.
 */

import { erpApi } from './erpApi.js';
import { ERP_ENDPOINTS, IS_ERP_CONFIGURED } from '../config/apiConfig.js';

export const STOCK_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  PRE_ORDER: 'PRE_ORDER',
  UNKNOWN: 'UNKNOWN',
};

const STATUS_CONFIG_UZ = {
  [STOCK_STATUS.AVAILABLE]: {
    label: 'Omborda mavjud',
    badgeClass: 'stock-available',
    isOrderable: true,
  },
  [STOCK_STATUS.OUT_OF_STOCK]: {
    label: 'Hozirda tugagan',
    badgeClass: 'stock-out',
    isOrderable: false,
  },
  [STOCK_STATUS.PRE_ORDER]: {
    label: 'Buyurtma asosida ishlab chiqariladi',
    badgeClass: 'stock-preorder',
    isOrderable: true,
  },
  [STOCK_STATUS.UNKNOWN]: {
    label: 'Mavjudlik so‘rov asosida',
    badgeClass: 'stock-unknown',
    isOrderable: true,
  },
};

export const inventoryService = {
  /**
   * Evaluates customer-facing availability without exposing internal warehouse quantities.
   */
  async getProductAvailability(productId) {
    if (!productId) {
      return {
        status: STOCK_STATUS.UNKNOWN,
        ...STATUS_CONFIG_UZ[STOCK_STATUS.UNKNOWN],
      };
    }

    if (IS_ERP_CONFIGURED) {
      const endpoint = ERP_ENDPOINTS.STOCK_AVAILABILITY(productId);
      const { data, error } = await erpApi.get(endpoint);

      if (!error && data) {
        let status = STOCK_STATUS.UNKNOWN;

        // Interpret ERP boolean or status flag
        if (data.in_stock === true || data.is_available === true) {
          status = STOCK_STATUS.AVAILABLE;
        } else if (data.in_stock === false || data.is_available === false) {
          status = data.can_preorder ? STOCK_STATUS.PRE_ORDER : STOCK_STATUS.OUT_OF_STOCK;
        } else if (typeof data.quantity === 'number') {
          // Internal count is transformed into binary customer status
          status = data.quantity > 0 ? STOCK_STATUS.AVAILABLE : STOCK_STATUS.OUT_OF_STOCK;
        }

        return {
          status,
          ...STATUS_CONFIG_UZ[status],
          isFromErp: true,
        };
      }
    }

    // Default safe fallback when ERP is not connected: Available or on-demand
    return {
      status: STOCK_STATUS.AVAILABLE,
      ...STATUS_CONFIG_UZ[STOCK_STATUS.AVAILABLE],
      isFromErp: false,
    };
  },
};

export default inventoryService;

