import { discountBoundary, getDiscountConfig, getDiscountStatus, getPriceInfo } from './priceUtils.js';
import { productCategories } from './catalogUtils.js';

export { getDiscountConfig, getDiscountStatus } from './priceUtils.js';
export function getActiveDiscounts(products, now = Date.now()) {
  return products.filter(product => product.isVisible === true && getPriceInfo(product, now).hasDiscount);
}
export function filterDiscounts(products, { category = 'all', type = 'all', sort = 'recommended' } = {}, now = Date.now()) {
  const active = getActiveDiscounts(products, now).filter(product =>
    (category === 'all' || productCategories(product).includes(category)) &&
    (type === 'all' || getDiscountConfig(product).type === type));
  return [...active].sort((a, b) => {
    if (sort === 'largest') return getPriceInfo(b, now).discountPercent - getPriceInfo(a, now).discountPercent || a.name.localeCompare(b.name, 'uz');
    if (sort === 'ending') {
      const first = discountBoundary(getDiscountConfig(a).endDate, true), second = discountBoundary(getDiscountConfig(b).endDate, true);
      if (first !== second) return first < second ? -1 : 1;
    }
    return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) || a.name.localeCompare(b.name, 'uz');
  });
}
export function getCountdown(endDate, now = Date.now()) {
  if (!endDate) return null;
  const end = discountBoundary(endDate, true);
  if (!Number.isFinite(end) || !Number.isFinite(Number(now))) return null;
  // The end instant is inclusive, matching the shared pricing engine.
  const remainingMs = Math.max(0, end - Number(now) + 1);
  const seconds = Math.ceil(remainingMs / 1000);
  return { ended: remainingMs === 0, remainingMs, days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
}
export function formatDiscountEnd(endDate) {
  const end = discountBoundary(endDate, true);
  return Number.isFinite(end) ? new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(end) : null;
}
