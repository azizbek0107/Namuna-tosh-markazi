import assert from 'node:assert/strict';
import test, { describe, it } from 'node:test';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const testEntry = `
import { STONEX_ERP_API_URL, ERP_ENDPOINTS, IS_ERP_CONFIGURED } from './src/config/apiConfig.js';
import { formatApiError, categorizeError, ERROR_CODES } from './src/utils/apiErrorUtils.js';
import { adaptErpPrice, normalizePriceUnit } from './src/adapters/priceAdapter.js';
import { adaptErpProduct, adaptErpProducts, normalizeErpSizes } from './src/adapters/productAdapter.js';
import { adaptErpCategory, adaptErpCategories } from './src/adapters/categoryAdapter.js';
import { pricingService } from './src/services/pricingService.js';
import { inventoryService, STOCK_STATUS } from './src/services/inventoryService.js';
import { adminProductService } from './src/services/adminProductService.js';

export {
  STONEX_ERP_API_URL,
  ERP_ENDPOINTS,
  IS_ERP_CONFIGURED,
  formatApiError,
  categorizeError,
  ERROR_CODES,
  adaptErpPrice,
  normalizePriceUnit,
  adaptErpProduct,
  adaptErpProducts,
  normalizeErpSizes,
  adaptErpCategory,
  adaptErpCategories,
  pricingService,
  inventoryService,
  STOCK_STATUS,
  adminProductService,
};
`;

const bundle = await build({
  stdin: {
    contents: testEntry,
    resolveDir: process.cwd(),
    sourcefile: 'test-erp-entry.js',
    loader: 'js',
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  packages: 'external',
  loader: { '.css': 'empty', '.jpg': 'text', '.png': 'text' },
});

await mkdir('.sites-runtime', { recursive: true });
const target = resolve('.sites-runtime/test-erp-integration.mjs');
await writeFile(target, bundle.outputFiles[0].contents);

const {
  ERP_ENDPOINTS,
  IS_ERP_CONFIGURED,
  formatApiError,
  categorizeError,
  ERROR_CODES,
  adaptErpPrice,
  normalizePriceUnit,
  adaptErpProduct,
  adaptErpProducts,
  normalizeErpSizes,
  adaptErpCategory,
  pricingService,
  inventoryService,
  STOCK_STATUS,
  adminProductService,
} = await import(pathToFileURL(target).href);

describe('Stage 11: StoneX ERP API Config & Endpoints', () => {
  it('correctly constructs required REST endpoints without trailing slash breaks', () => {
    assert.equal(ERP_ENDPOINTS.HEALTH, '/health');
    assert.equal(ERP_ENDPOINTS.PRODUCTS, '/api/v1/products');
    assert.equal(ERP_ENDPOINTS.PRODUCT_BY_ID('angola-123'), '/api/v1/products/angola-123');
    assert.equal(ERP_ENDPOINTS.PRODUCT_PRICING('gazgan-456'), '/api/v1/products/gazgan-456/pricing');
    assert.equal(ERP_ENDPOINTS.CATEGORIES, '/api/v1/categories');
    assert.equal(ERP_ENDPOINTS.STOCK_AVAILABILITY('prod-1'), '/api/v1/products/prod-1/availability');
    assert.equal(ERP_ENDPOINTS.ADMIN_PRICE_UPDATE('prod-1'), '/api/v1/admin/products/prod-1/price');
  });

  it('correctly reports configuration status without throwing', () => {
    assert.equal(typeof IS_ERP_CONFIGURED, 'boolean');
  });
});

describe('Stage 11: Error Sanitization & Uzbek Messages', () => {
  it('categorizes HTTP status codes accurately', () => {
    assert.equal(categorizeError(null, 401), ERROR_CODES.UNAUTHORIZED);
    assert.equal(categorizeError(null, 403), ERROR_CODES.FORBIDDEN);
    assert.equal(categorizeError(null, 404), ERROR_CODES.NOT_FOUND);
    assert.equal(categorizeError(null, 429), ERROR_CODES.RATE_LIMITED);
    assert.equal(categorizeError(null, 500), ERROR_CODES.SERVER_ERROR);
  });

  it('formats errors in respectful Uzbek language and masks sensitive details', () => {
    const sensitiveErr = new Error('SQL syntax error at postgresql://user:secret123@db.internal:5432');
    const formatted = formatApiError(sensitiveErr, 500);

    assert.equal(formatted.code, ERROR_CODES.SERVER_ERROR);
    assert.match(formatted.message, /boshqaruv serverida vaqtinchalik nosozlik/i);
    // Verifies sensitive internal connection string is never leaked
    assert.ok(!formatted.message.includes('postgresql'));
    assert.ok(!formatted.message.includes('secret123'));
  });
});

describe('Stage 11: Price Adapter (Authoritative ERP Prices)', () => {
  it('normalizes units correctly', () => {
    assert.equal(normalizePriceUnit('dona'), 'piece');
    assert.equal(normalizePriceUnit('PIECE'), 'piece');
    assert.equal(normalizePriceUnit('sqm'), 'm2');
    assert.equal(normalizePriceUnit('M2'), 'm2');
    assert.equal(normalizePriceUnit('pogon_metr'), 'linear_m');
    assert.equal(normalizePriceUnit('LINEAR_M'), 'linear_m');
    assert.equal(normalizePriceUnit(null), 'm2');
  });

  it('adapts flat and nested ERP price records and strips internal financial costs', () => {
    const erpRecord = {
      id: 'erp-stone-01',
      price: 380000,
      price_unit: 'm2',
      cost_price: 190000, // confidential internal field
      purchase_price: 150000, // confidential internal field
      profit_margin: 0.5, // confidential internal field
    };

    const adapted = adaptErpPrice(erpRecord);
    assert.equal(adapted.price, 380000);
    assert.equal(adapted.priceUnit, 'm2');
    assert.equal(adapted.isPriceAvailable, true);
    assert.match(adapted.formatted, /380\s*000\s*so‘m/);

    // Strips internal costs
    assert.equal(adapted.cost_price, undefined);
    assert.equal(adapted.purchase_price, undefined);
    assert.equal(adapted.profit_margin, undefined);
  });

  it('handles unpriced or inquiry-based products gracefully', () => {
    const unpricedRecord = { id: 'custom-monument', price: null };
    const adapted = adaptErpPrice(unpricedRecord);
    assert.equal(adapted.price, null);
    assert.equal(adapted.isPriceAvailable, false);
    assert.equal(adapted.formatted, 'Narx so‘rov asosida');
  });
});

describe('Stage 11: Product Adapter (ERP Synchronization)', () => {
  it('preserves ERP product ID and normalizes dimensions and customer fields', () => {
    const rawErpProduct = {
      id: 'ERP-GRANITE-88',
      name: 'Angola Black Imperial',
      category: 'keramogranit',
      retail_price: 450000,
      price_unit: 'm2',
      sizes: [
        { width_cm: 60, length_cm: 120, thickness_mm: 20 },
        { width_cm: 30, length_cm: 60, thickness_mm: 15 },
      ],
      images: ['https://cdn.stonex.uz/images/angola-1.webp'],
      in_stock: true,
      warehouse_inventory_count: 8500, // internal warehouse data
      supplier_code: 'SUPP-ANGOLA-9', // confidential
    };

    const product = adaptErpProduct(rawErpProduct);
    assert.equal(product.id, 'ERP-GRANITE-88');
    assert.equal(product.name, 'Angola Black Imperial');
    assert.equal(product.price, 450000);
    assert.equal(product.sizes.length, 2);
    assert.deepEqual(product.sizes[0], { widthCm: 60, lengthCm: 120, thicknessMm: 20 });
    assert.equal(product.isAvailable, true);

    // Confidential fields are completely stripped
    assert.equal(product.warehouse_inventory_count, undefined);
    assert.equal(product.supplier_code, undefined);
  });
});

describe('Stage 11: Customer-Safe Inventory Service', () => {
  it('masks internal quantities into safe customer availability statuses', async () => {
    const avail = await inventoryService.getProductAvailability('angola-black');
    assert.ok(avail.status);
    assert.ok(avail.label);
    assert.ok([STOCK_STATUS.AVAILABLE, STOCK_STATUS.OUT_OF_STOCK, STOCK_STATUS.UNKNOWN, STOCK_STATUS.PRE_ORDER].includes(avail.status));
    // Verify no numeric inventory balance is leaked
    assert.equal(typeof avail.quantity, 'undefined');
    assert.equal(typeof avail.balance, 'undefined');
  });
});

describe('Stage 11: Pricing Service & Cache Integrity', () => {
  it('retrieves authoritative price and manages memory cache', async () => {
    const priceRes = await pricingService.getAuthoritativePrice('angola-black');
    assert.ok(priceRes);
    assert.equal(typeof priceRes.formatted, 'string');

    // Cache clearing does not throw
    pricingService.clearPriceCache('angola-black');
    pricingService.clearPriceCache();
  });
});

describe('Stage 11: Admin Price Update Workflow', () => {
  it('rejects invalid or negative prices before making requests', async () => {
    const resNegative = await adminProductService.updateErpPrice('prod-1', -50000);
    assert.equal(resNegative.success, false);
    assert.match(resNegative.error, /musbat butun son/i);

    const resZero = await adminProductService.updateErpPrice('prod-1', 0);
    assert.equal(resZero.success, false);
  });

  it('checks ERP capabilities safely without throwing', async () => {
    const capabilities = await adminProductService.checkErpCapabilities();
    assert.ok(typeof capabilities.isConnected === 'boolean');
    assert.ok(typeof capabilities.statusMessage === 'string');
  });
});

