/**
 * priceAdapter.js
 * 
 * Adapts authoritative StoneX ERP pricing structures to the Namuna Tosh Markazi web model.
 * 
 * SECURITY & BUSINESS RULES:
 * 1. StoneX ERP is the sole source of truth for base product prices.
 * 2. Internal financial data (cost prices, purchase prices, profit margins) are stripped.
 * 3. Units are normalized to 'm2', 'linear_m', or 'piece'.
 * 4. Ensures consistent rounding and formatting using existing price utilities.
 */

import { isValidPrice, formatMoney, formatPrice, unitLabel } from '../utils/priceUtils.js';

/**
 * Normalizes an ERP price unit identifier to the website's standard unit.
 */
export function normalizePriceUnit(rawUnit) {
  if (!rawUnit) return 'm2';
  const u = String(rawUnit).trim().toLowerCase();

  if (['piece', 'dona', 'pcs', 'shtuk', 'pc'].includes(u)) {
    return 'piece';
  }
  if (['linear_m', 'linear_meter', 'pogon_metr', 'pogon', 'lm', 'm'].includes(u)) {
    return 'linear_m';
  }
  // Default stone measurement is square meter
  return 'm2';
}

/**
 * Extracts and sanitizes the customer-facing price from an ERP record.
 * Strips confidential supplier and cost data.
 */
export function adaptErpPrice(rawRecord) {
  if (!rawRecord) {
    return {
      price: null,
      priceUnit: 'm2',
      formatted: 'Narx so‘rov asosida',
      isPriceAvailable: false,
    };
  }

  // Handle both flat fields and nested pricing objects
  let rawPrice = rawRecord.price;
  let rawUnit = rawRecord.price_unit || rawRecord.priceUnit || rawRecord.unit;

  if (typeof rawRecord.pricing === 'object' && rawRecord.pricing !== null) {
    rawPrice = rawRecord.pricing.amount ?? rawRecord.pricing.retail_price ?? rawPrice;
    rawUnit = rawRecord.pricing.unit ?? rawUnit;
  }

  // If explicit retail_price or customer_price exists in ERP record
  if (rawRecord.retail_price !== undefined) {
    rawPrice = rawRecord.retail_price;
  }

  const numericPrice = typeof rawPrice === 'string' ? parseFloat(rawPrice) : Number(rawPrice);
  const valid = isValidPrice(numericPrice) && numericPrice > 0;
  const unit = normalizePriceUnit(rawUnit);

  return {
    price: valid ? numericPrice : null,
    priceUnit: unit,
    unitLabel: unitLabel(unit),
    formatted: valid ? formatPrice(numericPrice, unit) : 'Narx so‘rov asosida',
    isPriceAvailable: valid,
  };
}

export default {
  normalizePriceUnit,
  adaptErpPrice,
};

