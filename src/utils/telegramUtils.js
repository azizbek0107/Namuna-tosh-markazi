import { TELEGRAM_URL } from '../config/contactConfig.js';
import { getBrand } from '../config/brandConfig.js';
import { getDiscountConfig, calculateTotal, formatMoney, formatPrice, getPriceInfo, unitLabel, validQuantity } from './priceUtils.js';
import { formatSize } from './catalogUtils.js';
import { calculateOrder, formatMeasure, measurementLabel, normalizeUzPhone, validateCustomer } from './calculatorUtils.js';

// Re-export so existing callers continue to work.
export const telegramChatUrl = TELEGRAM_URL;
export const orderUrl = TELEGRAM_URL;

export function buildCalculatorOrderText(product, { size = null, quantity = 1, mode, customer = {}, now = Date.now(), language = 'uz' } = {}) {
  const discount = getDiscountConfig(product);
  const calculation = calculateOrder(product, { size, quantity, mode, now });
  if (!calculation.valid || Object.keys(validateCustomer(customer)).length) return '';
  const lines = [
    `${getBrand(language).title} — YANGI BUYURTMA`, '',
    `Mahsulot: ${product.name}`, `O'lcham: ${formatSize(size)}`,
    `Miqdor: ${formatMeasure(calculation.quantity)} ${mode === 'pieces' || product.priceUnit === 'piece' ? 'dona' : unitLabel(product.priceUnit)}`,
    `${measurementLabel(product.priceUnit)}: ${formatMeasure(calculation.measurement)} ${unitLabel(product.priceUnit)}`,
    `Birlik narxi: ${formatPrice(product.price, product.priceUnit)}`,
    `Chegirmadan oldingi summa: ${formatMoney(calculation.subtotal)}`,
  ];
  if (calculation.hasDiscount) lines.push(`Chegirma: ${discount.type === 'percentage' ? `${Math.min(discount.value, 100)}% — ` : ''}${formatMoney(calculation.discountAmount)}`);
  lines.push(`Jami: ${formatMoney(calculation.total)}`, '', `Mijoz: ${customer.name.trim()}`, `Telefon: ${normalizeUzPhone(customer.phone)}`, `Izoh: ${String(customer.comment ?? '').trim() || 'Yo\u02BBq'}`, '', 'Mavjudlik, o\u02BCcham va yakuniy shartlarni tasdiqlab berishingizni so\u02BBrayman.');
  return lines.join('\n');
}

export function buildOrderText(product, { size = null, quantity = 1, now = Date.now(), language = 'uz' } = {}) {
  if (!validQuantity(quantity, product.priceUnit)) return '';
  const price = getPriceInfo(product, now);
  const total = calculateTotal(product, quantity, now);
  if (price.isPriced && total === null) return '';
  return [
    `Assalomu alaykum, ${getBrand(language).name}!`, 'Quyidagi mahsulot bo\u02BBYicha murojaat qilmoqchiman:', '',
    `Mahsulot: ${product.name}`, `O'lcham: ${formatSize(size)}`, `Miqdor: ${Number(quantity)} ${unitLabel(product.priceUnit)}`,
    `Narx birligi: ${unitLabel(product.priceUnit)}`, `Birlik narxi: ${formatPrice(product.price, product.priceUnit)}`,
    `Jami summa: ${total === null ? 'narx kelishilgach aniqlanadi' : formatMoney(total)}`, '',
    'Mavjudligi, aniq o\u02BCchamlar va yakuniy shartlarni tasdiqlab berishingizni so\u02BBrayman.',
  ].join('\n');
}
