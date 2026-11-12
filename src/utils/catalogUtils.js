import { categoryName } from '../data/categories.js';
import { getPriceInfo } from './priceUtils.js';

export function productCategories(product) { return [...new Set([product.category, ...(product.categories ?? [])].filter(Boolean))]; }
export function sizeKey(size) { return `${size.widthCm ?? ''}x${size.lengthCm ?? ''}x${size.thicknessMm ?? ''}`; }
export function formatSize(size) {
  if (!size) return 'O‘lcham aniqlashtiriladi';
  const width = size.widthCm ?? size.tile_width ?? size.width;
  const length = size.lengthCm ?? size.tile_length ?? size.length;
  const thickness = size.thicknessMm ?? size.thickness;
  const dimensions = width > 0 && length > 0 ? `${width} × ${length} cm` : 'O‘lcham aniqlashtiriladi';
  return thickness > 0 ? `${dimensions} · ${thickness} mm` : dimensions;
}
export const normalizeSearch = text => String(text ?? '').toLocaleLowerCase('uz').normalize('NFKC').replace(/[‘’ʻʼ`]/g, "'").trim();
export function filterProducts(products, filters, now = Date.now()) {
  const query = normalizeSearch(filters.query);
  return products.filter(product => {
    if (!product.isVisible) return false;
    const categoryIds = productCategories(product);
    if (filters.category && filters.category !== 'all' && !categoryIds.includes(filters.category)) return false;
    const sizes = product.sizes ?? [];
    if (filters.size === 'unknown' && sizes.length) return false;
    if (filters.size && filters.size !== 'all' && filters.size !== 'unknown' && !sizes.some(size => sizeKey(size) === filters.size)) return false;
    if (query && !normalizeSearch([product.name, product.description, ...categoryIds.map(categoryName), ...categoryIds.map(c => (c === 'kerama-granit' || c === 'keramogranit') ? 'keramogranit kerama granit' : '')].join(' ')).includes(query)) return false;
    const price = getPriceInfo(product, now);
    if (filters.discounted && !price.hasDiscount) return false;
    if (!price.isPriced) return filters.includeUnpriced !== false;
    if (filters.min !== '' && filters.min != null && price.finalPrice < Number(filters.min)) return false;
    if (filters.max !== '' && filters.max != null && price.finalPrice > Number(filters.max)) return false;
    return true;
  });
}
export function sortProducts(products, sort = 'recommended', now = Date.now()) {
  const collator = new Intl.Collator('uz', { numeric: true, sensitivity: 'base' });
  return [...products].sort((a, b) => {
    if (sort === 'name-asc') return collator.compare(a.name, b.name);
    if (sort === 'name-desc') return collator.compare(b.name, a.name);
    if (sort === 'price-asc' || sort === 'price-desc') {
      const first = getPriceInfo(a, now), second = getPriceInfo(b, now);
      if (!first.isPriced && !second.isPriced) return collator.compare(a.name, b.name);
      if (!first.isPriced) return 1;
      if (!second.isPriced) return -1;
      return (sort === 'price-asc' ? 1 : -1) * (first.finalPrice - second.finalPrice) || collator.compare(a.name, b.name);
    }
    if (sort === 'newest') return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || collator.compare(a.name, b.name);
    return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) || collator.compare(a.name, b.name);
  });
}
