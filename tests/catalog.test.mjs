import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPriceInfo, formatPrice, calculateTotal, validQuantity } from '../src/utils/priceUtils.js';
import { filterProducts, sortProducts, sizeKey } from '../src/utils/catalogUtils.js';
import { buildOrderText, telegramChatUrl } from '../src/utils/telegramUtils.js';

const now = Date.parse('2026-11-02T12:00:00+05:00');
const size = { widthCm: 60, lengthCm: 60, thicknessMm: 9 };
// Synthetic fixtures exercise future admin data; they are never shown in the catalog.
const sample = {
  id: 'test', name: 'Test stone', category: 'kerama-granit', categories: ['sokl'],
  description: 'Qora naqsh', isVisible: true, isFeatured: true,
  sizes: [size], price: 250000, priceUnit: 'm2', discountType: 'percentage', discountValue: 20,
  createdAt: '2026-11-02',
};

test('prices, units, percentage/fixed discounts and safe quantities', () => {
  assert.equal(formatPrice(250000, 'm2'), '250 000 so‘m / m²');
  assert.equal(formatPrice(250000, 'piece'), '250 000 so‘m / dona');
  assert.equal(formatPrice(250000, 'linear_m'), '250 000 so‘m / pogon metr');
  assert.equal(getPriceInfo(sample, now).finalPrice, 200000);
  assert.equal(getPriceInfo({ ...sample, discountType: 'fixed', discountValue: 50000 }, now).finalPrice, 200000);
  for (const discountType of ['fixed', 'percentage']) {
    assert.equal(getPriceInfo({ ...sample, discountType, discountValue: 1000000 }, now).finalPrice, 0);
  }
  for (const price of [null, undefined, -1, NaN, Infinity, '250000']) {
    assert.equal(getPriceInfo({ ...sample, price }, now).isPriced, false);
  }
  assert.equal(getPriceInfo({ ...sample, discountValue: -20 }, now).hasDiscount, false);
  assert.equal(getPriceInfo({ ...sample, price: null }, now).hasDiscount, false);
  assert.equal(getPriceInfo({ ...sample, price: 0 }, now).finalPrice, 0);
  assert.equal(calculateTotal(sample, 2.5, now), 500000);
  assert.equal(calculateTotal({ ...sample, price: null }, 2, now), null);
  assert.equal(validQuantity('1.5', 'piece'), false);
  assert.equal(validQuantity('0.01', 'm2'), true);
  assert.equal(validQuantity('0.001', 'm2'), false);
  assert.equal(validQuantity('0', 'm2'), false);
  assert.equal(calculateTotal({ ...sample, price: Number.MAX_SAFE_INTEGER, discountValue: 0 }, 2, now), null);
});

test('discount dates include the entire Tashkent business day', () => {
  const product = { ...sample, discountStartsAt: '2026-11-02', discountEndsAt: '2026-11-02' };
  for (const date of ['2026-11-02T00:00:00+05:00', '2026-11-02T23:59:59.999+05:00']) {
    assert.equal(getPriceInfo(product, Date.parse(date)).hasDiscount, true);
  }
  for (const date of ['2026-11-01T23:59:59.999+05:00', '2026-11-03T00:00:00+05:00']) {
    assert.equal(getPriceInfo(product, Date.parse(date)).hasDiscount, false);
  }
  assert.equal(getPriceInfo({ ...product, discountEndsAt: 'invalid' }, now).hasDiscount, false);
  assert.equal(getPriceInfo({ ...product, discountEndsAt: '2026-11-01' }, now).hasDiscount, false);
});

test('search, multiple categories, size, price and discount filters combine', () => {
  const filters = { query: 'QORA', category: 'sokl', size: sizeKey(size), min: '190000', max: '210000', discounted: true, includeUnpriced: false };
  assert.deepEqual(filterProducts([sample], filters, now), [sample]);
  assert.deepEqual(filterProducts([sample], { ...filters, max: '199999' }, now), []);
  assert.deepEqual(filterProducts([sample], { query: 'KERAMA GRANIT' }, now), [sample]);
  assert.deepEqual(filterProducts([{ ...sample, isVisible: false }], {}, now), []);
  const unknown = { ...sample, price: null, sizes: [] };
  assert.deepEqual(filterProducts([unknown], { min: '999999', size: 'unknown' }, now), [unknown]);
  assert.deepEqual(filterProducts([unknown], { includeUnpriced: false }, now), []);
  assert.deepEqual(filterProducts([unknown], { discounted: true }, now), []);
  assert.deepEqual(filterProducts([sample], { query: 'missing' }, now), []);
});

test('all sorting options keep unpriced products last for price sorting', () => {
  const items = [
    { ...sample, name: 'B', price: null, isFeatured: false, createdAt: '2026-10-01' },
    { ...sample, name: 'C', price: 300000, isFeatured: false, createdAt: '2026-10-02' },
    { ...sample, name: 'A', price: 100000 },
  ];
  const names = sort => sortProducts(items, sort, now).map(item => item.name).join('');
  assert.equal(names('recommended'), 'ABC');
  assert.equal(names('name-asc'), 'ABC');
  assert.equal(names('name-desc'), 'CBA');
  assert.equal(names('price-asc'), 'ACB');
  assert.equal(names('price-desc'), 'CAB');
  assert.equal(names('newest'), 'ACB');
  assert.equal(items[0].name, 'B', 'Sorting must not mutate source data');
});

test('Telegram order text has selected size, quantity, unit and discounted total', () => {
  const text = buildOrderText(sample, { size, quantity: 2.5, now });
  assert.match(text, /Mahsulot: Test stone/);
  assert.match(text, /60 × 60 cm · 9 mm/);
  assert.match(text, /Miqdor: 2.5 m²/);
  assert.match(text, /Jami summa: 500 000 so‘m/);
  const unknown = buildOrderText({ ...sample, price: null, sizes: [] }, { now });
  assert.match(unknown, /O‘lcham aniqlashtiriladi/);
  assert.match(unknown, /narx kelishilgach aniqlanadi/);
  assert.equal(buildOrderText(sample, { quantity: -1 }), '');
  assert.equal(telegramChatUrl, 'https://t.me/aura_200707');
});
