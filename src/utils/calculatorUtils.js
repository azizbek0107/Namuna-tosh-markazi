import { applyOrderDiscount, decimalFraction as fraction, roundFraction as rounded, isValidPrice, unitLabel } from './priceUtils.js';

// Decimal fractions keep area/length and money arithmetic exact until display.
const multiply = (a, b) => [a[0] * b[0], a[1] * b[1]];
const numberOf = value => Number(value[0]) / Number(value[1]);
const positive = value => value !== '' && value != null && Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= Number.MAX_SAFE_INTEGER && fraction(value) !== null;
export const formatMeasure = value => new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 8 }).format(value).replace(/[\u00a0\u202f]/g, ' ');

export function getQuantityModes(product) {
  if (product.priceUnit === 'piece') return ['pieces'];
  const configured = product.orderConfig?.quantityModes ?? ['direct', 'pieces'];
  return [...new Set(configured.filter(mode => mode === 'direct' || mode === 'pieces'))];
}
export function getLinearLengthField(product) {
  // Sokl length always uses lengthCm unless explicitly configured as widthCm.
  return product.orderConfig?.linearLengthField ?? 'lengthCm';
}
export function sizeSupportsPieces(product, size) {
  if (product.priceUnit === 'piece') return true;
  if (product.priceUnit === 'm2') return positive(size?.lengthCm) && positive(size?.widthCm);
  const field = getLinearLengthField(product);
  return product.priceUnit === 'linear_m' && ['lengthCm', 'widthCm'].includes(field) && positive(size?.[field]);
}
export function plateArea(size) {
  if (!positive(size?.lengthCm) || !positive(size?.widthCm)) return null;
  const area = multiply(fraction(size.lengthCm), fraction(size.widthCm));
  return numberOf([area[0], area[1] * 10000n]);
}

export function calculateOrder(product, { size = null, quantity = 1, mode = product.priceUnit === 'piece' ? 'pieces' : 'direct', now = Date.now() } = {}) {
  const empty = { valid: false, error: '', quantity: Number(quantity), mode, size, unit: product.priceUnit, measurement: null, areaPerPiece: null, isPriced: isValidPrice(product.price), subtotal: null, discountAmount: 0, discountPercent: 0, hasDiscount: false, total: null };
  const fail = error => ({ ...empty, error });
  if (!['piece', 'm2', 'linear_m'].includes(product.priceUnit) || !getQuantityModes(product).includes(mode)) return fail('Ushbu hisoblash usuli mahsulot uchun mavjud emas.');
  if (!positive(quantity)) return fail('Miqdor 0 dan katta son bo‘lishi kerak.');
  const count = Number(quantity);
  if (mode === 'pieces' && !Number.isSafeInteger(count)) return fail('Dona sonini musbat butun son bilan kiriting.');
  const quantityFraction = fraction(quantity);
  if (mode === 'direct' && (quantityFraction[0] * 100n) % quantityFraction[1] !== 0n) return fail('Miqdorni ko‘pi bilan ikki kasr xonasigacha kiriting.');
  // Only dimensions belonging to this product may be used for conversion.
  if (size && !(product.sizes ?? []).some(item => item === size || (item.widthCm === size.widthCm && item.lengthCm === size.lengthCm && item.thicknessMm === size.thicknessMm))) return fail('Tanlangan o‘lcham mahsulotda mavjud emas.');
  if (mode === 'pieces' && !sizeSupportsPieces(product, size)) return fail('Dona bo‘yicha hisoblash uchun o‘lchamni aniqlashtiring.');
  let measurement = quantityFraction;
  if (mode === 'pieces' && product.priceUnit === 'm2') {
    measurement = multiply(multiply(fraction(size.lengthCm), fraction(size.widthCm)), quantityFraction);
    measurement[1] *= 10000n;
  }
  if (mode === 'pieces' && product.priceUnit === 'linear_m') {
    measurement = multiply(fraction(size[getLinearLengthField(product)]), quantityFraction);
    measurement[1] *= 100n;
  }
  const measured = numberOf(measurement);
  if (!Number.isFinite(measured) || measured > Number.MAX_SAFE_INTEGER) return fail('Miqdor hisoblash chegarasidan oshib ketdi.');
  const result = { ...empty, valid: true, measurement: measured, areaPerPiece: product.priceUnit === 'm2' ? plateArea(size) : null };
  if (!result.isPriced) return result;
  const base = multiply(measurement, fraction(product.price));
  const subtotalCents = rounded([base[0] * 100n, base[1]]);
  if (subtotalCents > BigInt(Number.MAX_SAFE_INTEGER)) return fail('Summa hisoblash chegarasidan oshib ketdi. Miqdorni kamaytiring.');
  const discount = applyOrderDiscount(subtotalCents, product, now);
  return { ...result, subtotal: discount.originalPrice, total: discount.finalPrice, discountAmount: discount.discountAmount, discountPercent: discount.discountPercent, hasDiscount: discount.hasDiscount };
}

export function normalizeUzPhone(value) {
  const text = String(value ?? '').trim();
  if (!/^\+?[\d\s()-]+$/.test(text)) return null;
  const digits = text.replace(/\D/g, '');
  const full = digits.length === 9 && !text.startsWith('+') ? `998${digits}` : digits;
  return /^998\d{9}$/.test(full) ? `+${full}` : null;
}
export function validateCustomer(customer) {
  const errors = {};
  if (!String(customer.name ?? '').trim()) errors.name = 'Ismingizni kiriting.';
  if (!normalizeUzPhone(customer.phone)) errors.phone = 'Telefonni +998 90 123 45 67 ko‘rinishida kiriting.';
  return errors;
}
export function measurementLabel(unit) {
  return unit === 'm2' ? 'Umumiy yuza' : unit === 'linear_m' ? 'Umumiy uzunlik' : `Jami ${unitLabel(unit)}`;
}
