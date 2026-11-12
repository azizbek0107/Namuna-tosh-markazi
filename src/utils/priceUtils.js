export const priceUnits = { piece: 'dona', dona: 'dona', m2: 'm²', linear_m: 'pogon metr', m: 'm', kg: 'kg' };
export const unitLabel = (unit, language = 'uz') => ({
    oz: { piece: 'дона', dona: 'дона', m2: 'м²', linear_m: 'погон метр', m: 'м', kg: 'кг' },
    ru: { piece: 'шт.', dona: 'шт.', m2: 'м²', linear_m: 'пог. м', m: 'м', kg: 'кг' },
    en: { piece: 'pcs', dona: 'pcs', m2: 'm²', linear_m: 'linear m', m: 'm', kg: 'kg' },
  }[language]?.[unit] ?? priceUnits[unit] ?? 'birlik');
export const isValidPrice = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
export const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100;
export function formatMoney(value) {
  if (!isValidPrice(value)) return 'Narx so‘rov asosida';
  return `${new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 2 }).format(value).replace(/[\u00a0\u202f]/g, ' ')} so‘m`;
}
export function formatPrice(value, unit, language = 'uz') {
  if (!isValidPrice(value)) return { uz: 'Narx so‘rov asosida', oz: 'Нарх сўров асосида', ru: 'Цена по запросу', en: 'Price on request' }[language] || 'Narx so‘rov asosida';
  return `${formatMoney(value)} / ${unitLabel(unit, language)}`;
}

// Date-only boundaries cover the whole business day in Tashkent (UTC+05:00).
export function discountBoundary(value, end = false) {
  if (!value) return end ? Infinity : -Infinity;
  if (typeof value !== 'string') return NaN;
  const date = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (!date) return NaN;
  const calendar = new Date(`${date[0].slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== date[0].slice(0, 10)) return NaN;
  let text = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T${end ? '23:59:59.999' : '00:00:00.000'}+05:00` : value;
  if (/T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(text)) text += '+05:00';
  return Date.parse(text);
}
// Flat fields are the existing local model; nested API data is normalized here only.
export function getDiscountConfig(product) {
  if (Object.hasOwn(product, 'discount')) {
    const value = product.discount ?? {};
    return { type: value.type, value: value.value, startDate: value.startDate, endDate: value.endDate, isActive: value.isActive === true };
  }
  return { type: product.discountType, value: product.discountValue, startDate: product.discountStartsAt, endDate: product.discountEndsAt, isActive: product.discountIsActive !== false };
}
export function getDiscountStatus(product, now = Date.now()) {
  const discount = getDiscountConfig(product);
  if (!discount.isActive) return 'disabled';
  if (!['percentage', 'fixed'].includes(discount.type) || !isValidPrice(discount.value) || discount.value <= 0) return 'invalid';
  const start = discountBoundary(discount.startDate), end = discountBoundary(discount.endDate, true);
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || !Number.isFinite(Number(now))) return 'invalid';
  if (Number(now) < start) return 'scheduled';
  if (Number(now) > end) return 'expired';
  return 'active';
}
export function decimalFraction(value) {
  const match = String(value).trim().match(/^(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!match) return null;
  const exponent = Number(match[3] ?? 0) - (match[2]?.length ?? 0);
  if (Math.abs(exponent) > 24) return null;
  const digits = BigInt(match[1] + (match[2] ?? ''));
  return exponent >= 0 ? [digits * 10n ** BigInt(exponent), 1n] : [digits, 10n ** BigInt(-exponent)];
}
export const roundFraction = ([numerator, denominator]) => (numerator * 2n + denominator) / (2n * denominator);
export function applyOrderDiscount(subtotalCents, product, now = Date.now()) {
  const empty = { isPriced: false, originalPrice: null, finalPrice: null, discountAmount: 0, discountPercent: 0, hasDiscount: false };
  if (typeof subtotalCents !== 'bigint' || subtotalCents < 0n || subtotalCents > BigInt(Number.MAX_SAFE_INTEGER)) return empty;
  const discount = getDiscountConfig(product);
  let amount = 0n;
  if (getDiscountStatus(product, now) === 'active') {
    const value = decimalFraction(discount.value);
    if (value && discount.type === 'percentage') amount = discount.value >= 100 ? subtotalCents : roundFraction([subtotalCents * value[0], value[1] * 100n]);
    if (value && discount.type === 'fixed') amount = roundFraction([value[0] * 100n, value[1]]);
  }
  if (amount > subtotalCents) amount = subtotalCents;
  return { isPriced: true, originalPrice: Number(subtotalCents) / 100, finalPrice: Number(subtotalCents - amount) / 100, discountAmount: Number(amount) / 100, discountPercent: subtotalCents > 0n ? Number(roundFraction([amount * 10000n, subtotalCents])) / 100 : 0, hasDiscount: amount > 0n };
}
export function getPriceInfo(product, now = Date.now()) {
  const value = isValidPrice(product.price) ? decimalFraction(product.price) : null;
  return applyOrderDiscount(value ? roundFraction([value[0] * 100n, value[1]]) : null, product, now);
}
export function validQuantity(value, unit) {
  if (value === '' || value == null) return false;
  const quantity = Number(value);
  const isPiece = unit === 'piece' || unit === 'dona';
  return Number.isFinite(quantity) && quantity > 0 && quantity <= Number.MAX_SAFE_INTEGER && (isPiece ? Number.isSafeInteger(quantity) : Math.abs(quantity - roundMoney(quantity)) < 1e-8);
}
export function calculateTotal(product, quantity, now = Date.now()) {
  if (!isValidPrice(product.price) || !validQuantity(quantity, product.priceUnit)) return null;
  const price = decimalFraction(product.price), count = decimalFraction(quantity);
  if (!price || !count) return null;
  return applyOrderDiscount(roundFraction([price[0] * count[0] * 100n, price[1] * count[1]]), product, now).finalPrice;
}
