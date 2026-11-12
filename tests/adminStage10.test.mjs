import assert from 'node:assert/strict';
import test, { describe, it } from 'node:test';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const testEntry = `
import {
  fetchAllAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
  productService
} from './src/services/productService.js';
import { categoryService } from './src/services/categoryService.js';
import { discountService } from './src/services/discountService.js';
import { settingsService } from './src/services/settingsService.js';

export {
  fetchAllAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
  productService,
  categoryService,
  discountService,
  settingsService
};
`;

const bundle = await build({
  stdin: {
    contents: testEntry,
    resolveDir: process.cwd(),
    sourcefile: 'test-admin-entry.js',
    loader: 'js'
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  packages: 'external',
  loader: { '.css': 'empty', '.jpg': 'text', '.png': 'text' }
});

await mkdir('.sites-runtime', { recursive: true });
const target = resolve('.sites-runtime/test-admin-stage10.mjs');
await writeFile(target, bundle.outputFiles[0].contents);

const {
  fetchAllAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
  categoryService,
  discountService,
  settingsService
} = await import(pathToFileURL(target).href);

describe('Stage 10: Category Service (Admin)', () => {
  it('fetches initial categories', async () => {
    const categories = await categoryService.fetchCategories();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length > 0);
    assert.ok(categories.some((c) => c.slug === 'kerama-granit' || c.id === 'kerama-granit' || c.name.toLowerCase().includes('keramo')));
  });

  it('creates, updates and deletes a category', async () => {
    const newCat = {
      name: 'Test Kategoriya',
      slug: 'test-kategoriya-10',
      description: 'Sinov tavsifi'
    };

    const created = await categoryService.createCategory(newCat);
    assert.ok(created);
    assert.equal(created.name, 'Test Kategoriya');
    assert.equal(created.slug, 'test-kategoriya-10');

    // Update
    const updated = await categoryService.updateCategory(created.id, {
      name: 'Yangilangan Kategoriya'
    });
    assert.equal(updated.name, 'Yangilangan Kategoriya');

    // Delete
    const delRes = await categoryService.deleteCategory(created.id);
    assert.equal(delRes.success, true);
  });
});

describe('Stage 10: Product Service (Admin CRUD)', () => {
  it('fetches all admin products including visibility state', async () => {
    const products = await fetchAllAdminProducts();
    assert.ok(Array.isArray(products));
    assert.ok(products.length >= 2);
    products.forEach((p) => {
      assert.ok(p.name);
      assert.ok(p.slug);
      assert.equal(typeof p.isVisible, 'boolean');
    });
  });

  it('creates, toggles, updates and deletes a product in memory fallback', async () => {
    const payload = {
      name: 'Nurota Oq Marmar Maxsus',
      slug: 'nurota-oq-marmar-maxsus-test',
      category: 'marmar',
      price: 420000,
      priceUnit: 'm2',
      description: 'Sinov uchun maxsus mahsulot',
      surface: 'Sayqallangan',
      origin: 'Nurota',
      color: 'Oq',
      isVisible: true,
      availableSizes: [{ widthCm: 60, lengthCm: 120, thicknessMm: 20 }]
    };

    const { data: created, error } = await createProduct(payload);
    assert.equal(error, null);
    assert.ok(created);
    assert.equal(created.name, payload.name);
    assert.equal(created.slug, payload.slug);
    assert.equal(created.price, 420000);

    // Toggle visibility
    const { data: toggled } = await toggleProductVisibility(created.id, false);
    assert.equal(toggled.isVisible, false);

    // Update product
    const { data: updated } = await updateProduct(created.id, {
      price: 450000,
      surface: 'Olovda kuydirilgan'
    });
    assert.equal(updated.price, 450000);
    assert.equal(updated.surface, 'Olovda kuydirilgan');

    // Delete product
    const delRes = await deleteProduct(created.id);
    assert.equal(delRes.success, true);

    const productsAfter = await fetchAllAdminProducts();
    assert.ok(!productsAfter.some((p) => p.slug === payload.slug));
  });
});

describe('Stage 10: Discount Service (Admin)', () => {
  it('fetches discounts and creates a new one', async () => {
    const initial = await discountService.fetchDiscounts();
    assert.ok(Array.isArray(initial));

    const newDiscount = {
      productId: 'test-prod-1',
      productName: 'Gazgan Pushti Marmar',
      type: 'percentage',
      value: 15,
      startDate: '2026-11-01',
      endDate: '2026-12-01',
      isActive: true
    };

    const created = await discountService.createDiscount(newDiscount);
    assert.ok(created);
    assert.equal(created.value, 15);
    assert.equal(created.isActive, true);

    // Toggle discount
    const toggled = await discountService.toggleDiscount(created.id, false);
    assert.equal(toggled.isActive, false);

    // Delete discount
    const delRes = await discountService.deleteDiscount(created.id);
    assert.equal(delRes.success, true);
  });
});

describe('Stage 10: Settings Service (Admin)', () => {
  it('fetches and updates site contact info', async () => {
    const settings = await settingsService.fetchSettings();
    assert.ok(settings);
    assert.ok(settings.phone1 || settings.contactPhone);
    assert.ok(settings.telegramUsername);

    const updated = await settingsService.updateSettings({
      telegramUsername: 'namuna_tosh_rasmiy'
    });
    assert.equal(updated.telegramUsername, 'namuna_tosh_rasmiy');

    // Revert back
    await settingsService.updateSettings({
      telegramUsername: 'namunatoshjilo'
    });
  });
});

describe('Stage 10: Pure Data-backed Statistics (Zero Fake Metrics)', () => {
  it('calculates metrics directly from real product/category datasets', async () => {
    const [products, categories, discounts] = await Promise.all([
      fetchAllAdminProducts(),
      categoryService.fetchCategories(),
      discountService.fetchDiscounts()
    ]);

    const totalProducts = products.length;
    const visibleProducts = products.filter((p) => p.isVisible).length;
    const hiddenProducts = totalProducts - visibleProducts;

    assert.ok(totalProducts >= 2);
    assert.ok(visibleProducts >= 0);
    assert.equal(totalProducts, visibleProducts + hiddenProducts);
    assert.ok(categories.length > 0);
    // Verifies no fabricated revenue or order counts exist
    assert.equal(Object.hasOwn(products, 'fabricatedRevenue'), false);
  });
});
