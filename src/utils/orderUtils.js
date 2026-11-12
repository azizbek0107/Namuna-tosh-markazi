// Order utility — builds the Telegram message for the modal-based order flow.
// Reuses priceUtils and calculatorUtils; keeps all math consistent with the existing calculator.

import { TELEGRAM_URL } from '../config/contactConfig.js';
import { getBrand } from '../config/brandConfig.js';
import {
  getDiscountConfig,
  formatMoney,
  formatPrice,
  unitLabel,
} from './priceUtils.js';
import { formatSize } from './catalogUtils.js';
import {
  calculateOrder,
  formatMeasure,
  measurementLabel,
  normalizeUzPhone,
} from './calculatorUtils.js';
import { isCustomerValid } from './validationUtils.js';

export { TELEGRAM_URL as telegramUrl };

/**
 * Order workflow states (frontend-only, no backend).
 * Do NOT use payment_confirmed, order_received, order_delivered etc.
 */
export const ORDER_STEPS = {
  EDITING: 'editing',
  REVIEW: 'review',
  READY: 'ready_to_copy',
  COPIED: 'copied',
  TELEGRAM_OPENED: 'telegram_opened',
};

/**
 * Builds the full Uzbek order message for Telegram.
 * Returns an empty string when the order or customer data is incomplete.
 *
 * PRIVACY: Never log customer phone or name to the browser console.
 * No data is sent to external servers — the user copies and sends manually.
 */
export function buildOrderMessage(product, { size = null, quantity = 1, mode, customer = {}, now = Date.now(), language = 'uz' } = {}) {
  if (!product) return '';
  if (!isCustomerValid(customer)) return '';
  const calculation = calculateOrder(product, { size, quantity, mode, now });
  if (!calculation.valid) return '';

  const discount = getDiscountConfig(product);
  const phone = normalizeUzPhone(customer.phone) ?? String(customer.phone ?? '').trim();
  const comment = String(customer.comment ?? '').trim();
  const name = String(customer.name ?? '').trim();

  const lines = [
    getBrand(language).title,
    "YANGI BUYURTMA SO\u02BBROVI",
    '',
    `Mahsulot: ${product.name}`,
    `O\u02BCcham: ${formatSize(size)}`,
  ];

  // Thickness from selected size
  if (size?.thicknessMm > 0) lines.push(`Qalinlik: ${size.thicknessMm} mm`);

  // Quantity line
  const qtyUnit = mode === 'pieces' || product.priceUnit === 'piece' ? 'dona' : unitLabel(product.priceUnit);
  lines.push(`Miqdor: ${formatMeasure(calculation.quantity)} ${qtyUnit}`);

  // Derived measurement (area / linear length)
  if (calculation.measurement !== null && (mode === 'pieces' || product.priceUnit !== 'piece')) {
    lines.push(`${measurementLabel(product.priceUnit)}: ${formatMeasure(calculation.measurement)} ${unitLabel(product.priceUnit)}`);
  }

  // Pricing
  lines.push(`Birlik narxi: ${formatPrice(product.price, product.priceUnit)}`);

  if (calculation.subtotal !== null) {
    lines.push(`Asl summa: ${formatMoney(calculation.subtotal)}`);
  }

  if (calculation.hasDiscount) {
    const discountLine = discount.type === 'percentage'
      ? `Chegirma: ${Math.min(discount.value, 100)}% \u2014 ${formatMoney(calculation.discountAmount)}`
      : `Chegirma: ${formatMoney(calculation.discountAmount)}`;
    lines.push(discountLine);
  }

  if (calculation.total !== null) {
    lines.push(`Yakuniy summa: ${formatMoney(calculation.total)}`);
  } else {
    lines.push('Narx: Kelishiladi');
  }

  lines.push('');
  lines.push("MIJOZ MA\u02BBLUMOTLARI");
  lines.push(`Ism: ${name}`);
  lines.push(`Telefon: ${phone}`);
  if (comment) lines.push(`Izoh: ${comment}`);

  lines.push('');
  lines.push("Mavjudlik, o\u02BCcham va yakuniy shartlarni tasdiqlab berishingizni so\u02BBrayman.");

  return lines.join('\n');
}
