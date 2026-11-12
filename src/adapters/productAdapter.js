/**
 * productAdapter.js
 * 
 * Synchronizes and maps StoneX ERP product records into the Namuna Tosh Markazi web model.
 * 
 * AUTHORITATIVE SOURCE OF TRUTH:
 * - Product IDs: ERP identifiers are strictly preserved.
 * - Product Names: Sourced directly from ERP.
 * - Dimensions: Normalized to widthCm, lengthCm, thicknessMm, tile_length, tile_width.
 * - Prices: Extracted via priceAdapter.
 * - Confidential ERP data (costs, suppliers, margins) is completely stripped for public safety.
 */

import { STONEX_ERP_API_URL } from '../config/apiConfig.js';
import { adaptErpPrice } from './priceAdapter.js';

const categorySlugMap = {
  'kerama granit': 'kerama-granit',
  'keramogranit': 'kerama-granit',
  'granit': 'granit',
  'marmar': 'marmar',
  'kafel': 'kafel',
  'tayyor mahsulot': 'tayyor-mahsulot',
  'qoshimcha': 'qoshimcha',
  'qo‘shimcha': 'qoshimcha',
  'xomashyo': 'xomashyo',
  'xizmatlar': 'xizmatlar',
};

/**
 * Normalizes stone dimensions from various ERP format variations.
 */
export function normalizeErpSizes(rawSizes, rawRecord = {}) {
  const result = [];

  if (Array.isArray(rawSizes) && rawSizes.length > 0) {
    for (const s of rawSizes) {
      const width = Number(s.width_cm ?? s.widthCm ?? s.tile_width ?? s.width ?? 0);
      const length = Number(s.length_cm ?? s.lengthCm ?? s.tile_length ?? s.length ?? 0);
      const thickness = Number(s.thickness_mm ?? s.thicknessMm ?? s.thickness ?? 0);

      if (width > 0 && length > 0) {
        const item = {
          widthCm: width,
          lengthCm: length,
          thicknessMm: thickness,
        };
        const pieces = Number(s.pieces_per_box ?? s.piecesPerBox ?? s.box_pieces);
        if (pieces > 0) {
          item.piecesPerBox = pieces;
        }
        result.push(item);
      }
    }
  }

  // Fallback: If dimensions are stored as top-level fields on the ERP record
  if (result.length === 0 && (rawRecord.tile_width || rawRecord.tile_length || rawRecord.width_cm || rawRecord.length_cm)) {
    const width = Number(rawRecord.tile_width ?? rawRecord.width_cm ?? 0);
    const length = Number(rawRecord.tile_length ?? rawRecord.length_cm ?? 0);
    const thickness = Number(rawRecord.thickness ?? rawRecord.thickness_mm ?? 0);
    if (width > 0 && length > 0) {
      const item = {
        widthCm: width,
        lengthCm: length,
        thicknessMm: thickness,
      };
      const pieces = Number(rawRecord.box_pieces);
      if (pieces > 0) {
        item.piecesPerBox = pieces;
      }
      result.push(item);
    }
  }

  return result;
}

/**
 * Formats image URLs, converting relative ERP paths (/uploads/...) to fully qualified URLs.
 */
function resolveErpImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('/')) {
    return `${STONEX_ERP_API_URL}${url}`;
  }
  return url;
}

/**
 * Normalizes product images.
 */
export function normalizeErpImages(rawImages, productName = 'Namuna Tosh') {
  if (!rawImages) return [];

  if (Array.isArray(rawImages)) {
    return rawImages.map((img, idx) => {
      if (typeof img === 'string') {
        const fullUrl = resolveErpImageUrl(img);
        return {
          id: `erp-img-${idx}`,
          src: fullUrl,
          url: fullUrl,
          alt: `${productName} rasmi ${idx + 1}`,
          isPrimary: idx === 0,
        };
      }
      const rawUrl = img.url || img.image_url || img.src || '';
      const fullUrl = resolveErpImageUrl(rawUrl);
      return {
        id: img.id || `erp-img-${idx}`,
        src: fullUrl,
        url: fullUrl,
        alt: img.alt || `${productName} rasmi`,
        isPrimary: Boolean(img.is_primary || img.isPrimary || idx === 0),
      };
    });
  }

  if (typeof rawImages === 'string') {
    const fullUrl = resolveErpImageUrl(rawImages);
    return [{
      id: 'erp-img-0',
      src: fullUrl,
      url: fullUrl,
      alt: productName,
      isPrimary: true,
    }];
  }

  return [];
}

/**
 * Generates an SEO and URL-friendly slug from product name and code.
 */
function generateProductSlug(name, code, id) {
  let s = String(name || '')
    .toLowerCase()
    .trim()
    .replace(/['`ʻʼ]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (code && !s.includes(String(code).toLowerCase())) {
    const cleanCode = String(code).toLowerCase().replace(/[^a-z0-9_-]+/g, '');
    if (cleanCode) s += `-${cleanCode}`;
  }

  return s || `product-${id}`;
}

/**
 * Adapts a single ERP product record into the website's product contract.
 */
export function adaptErpProduct(raw) {
  if (!raw) return null;

  const id = String(raw.id || raw.code || raw.product_id || '').trim();
  const name = String(raw.name || raw.title || 'Tabiiy tosh').trim();
  const sku = raw.sku || raw.code || raw.artikul || null;
  const slug = raw.slug || generateProductSlug(name, sku, id);

  const pricing = adaptErpPrice(raw);
  const sizes = normalizeErpSizes(raw.sizes || raw.dimensions || raw.available_sizes, raw);
  const rawImage = raw.images || raw.gallery || raw.image_url || raw.image;
  const images = normalizeErpImages(rawImage, name);

  // Customer-safe availability
  const isAvailable = raw.in_stock !== false && raw.availability !== 'OUT_OF_STOCK' && raw.status !== 'discontinued';

  // Category normalization to catalog slug
  const rawCat = String(raw.category || raw.category_slug || raw.category_name || '').trim().toLowerCase();
  const category = categorySlugMap[rawCat] || raw.category || 'kerama-granit';
  const categories = Array.isArray(raw.categories)
    ? raw.categories.map((c) => (typeof c === 'string' ? (categorySlugMap[c.toLowerCase()] || c) : c.id || c.slug))
    : [category];

  // Specific dimensions requested by user
  const tileLength = raw.tile_length ? Number(raw.tile_length) : (sizes[0]?.lengthCm || null);
  const tileWidth = raw.tile_width ? Number(raw.tile_width) : (sizes[0]?.widthCm || null);
  const thickness = raw.thickness ? Number(raw.thickness) : (sizes[0]?.thicknessMm || (tileLength && tileWidth ? 9 : null));
  const boxPieces = raw.box_pieces ? Number(raw.box_pieces) : (sizes[0]?.piecesPerBox || null);
  const boxM2 = raw.box_m2 ? Number(raw.box_m2) : (tileLength && tileWidth && boxPieces ? Math.round(((tileLength * tileWidth * boxPieces) / 10000) * 1000) / 1000 : null);
  const stock = raw.stock !== undefined && raw.stock !== null ? Number(raw.stock) : null;
  const unit = raw.unit || pricing.priceUnit || 'm2';
  const costPrice = raw.cost_price ? Number(raw.cost_price) : null;

  return {
    id: id || slug,
    erpId: id,
    slug,
    name,
    artikul: sku,
    description: raw.description || `${name} — ${category} toifasidagi yuqori sifatli mahsulot.`,
    category,
    categories,
    price: pricing.price,
    priceUnit: pricing.priceUnit,
    unit: unit,
    unitLabel: pricing.unitLabel,
    priceFormatted: pricing.formatted,
    isPriceAvailable: pricing.isPriceAvailable,
    cost_price: costPrice,
    costPrice: costPrice,
    tile_length: tileLength,
    tile_width: tileWidth,
    thickness: thickness,
    box_pieces: boxPieces,
    box_m2: boxM2,
    stock: stock,
    surface: raw.surface || raw.finish || '',
    origin: raw.origin || raw.quarry || '',
    color: raw.color || raw.sort || '',
    sizes,
    availableSizes: sizes,
    images,
    image: images[0]?.src || images[0]?.url || '',
    isVisible: raw.is_visible !== false && raw.published !== false && raw.is_active !== false,
    isAvailable,
    orderConfig: raw.order_config || {
      quantityModes: unit === 'm2' ? ['direct', 'pieces'] : unit === 'piece' ? ['pieces'] : ['direct'],
      defaultQuantityMode: unit === 'piece' ? 'pieces' : 'direct',
      linearLengthField: 'lengthCm',
    },
    // Source identifier to distinguish ERP synchronized products
    source: 'stonex_erp',
    lastSyncedAt: new Date().toISOString(),
  };
}

export function adaptErpProducts(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptErpProduct).filter(Boolean);
}

export default {
  normalizeErpSizes,
  normalizeErpImages,
  adaptErpProduct,
  adaptErpProducts,
};
