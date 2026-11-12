import assert from 'node:assert/strict';
import { test } from 'node:test';
import { discountBoundary, getDiscountConfig, getDiscountStatus, getPriceInfo, calculateTotal } from '../src/utils/priceUtils.js';
import { calculateOrder } from '../src/utils/calculatorUtils.js';
import { buildCalculatorOrderText } from '../src/utils/telegramUtils.js';
import { filterDiscounts, formatDiscountEnd, getActiveDiscounts, getCountdown } from '../src/utils/discountUtils.js';
import { discountTestProducts as fixtures, discountTestNow as now } from './fixtures/discountProducts.mjs';
const product = fixtures[0];

test('percentage and fixed promotions use the shared money engine', () => {
  assert.equal(getPriceInfo(product, now).finalPrice, 200000);
  assert.equal(getPriceInfo(fixtures[1], now).finalPrice, 250000);
  assert.equal(calculateOrder(fixtures[1], { quantity: 2, now }).total, 550000);
  assert.equal(calculateTotal(fixtures[1], 2, now), 550000);
});
for (const [value, expected] of [[0, 250000], [100, 0], [150, 0]]) {
  test(`percentage edge case ${value}%`, () => {
    const changed = { ...product, discountValue: value };
    assert.equal(getPriceInfo(changed, now).finalPrice, expected);
    assert.equal(getPriceInfo(changed, now).hasDiscount, value > 0);
  });
}
test('fixed discounts are capped at the order total; unpriced offers are excluded', () => {
  assert.equal(getPriceInfo({ ...product, discountType: 'fixed', discountValue: 9999999 }, now).finalPrice, 0);
  assert.equal(getPriceInfo({ ...product, price: null }, now).hasDiscount, false);
  assert.deepEqual(getActiveDiscounts(fixtures, now).map(item => item.id), ['test-percentage', 'test-fixed']);
});
test('scheduled, active, expired and disabled statuses are distinct', () => {
  assert.equal(getDiscountStatus(product, now - 3 * 86400000), 'scheduled');
  assert.equal(getDiscountStatus(product, now), 'active');
  assert.equal(getDiscountStatus(product, now + 5001), 'expired');
  assert.equal(getDiscountStatus({ ...product, discountIsActive: false }, now), 'disabled');
  assert.equal(getPriceInfo(product, now + 5001).finalPrice, product.price);
});
test('nested API discounts and legacy flat records normalize through one adapter', () => {
  const nested = { ...product, discount: { type: 'fixed', value: 50000, startDate: '2026-11-01', endDate: '2026-11-02', isActive: true } };
  assert.equal(getDiscountConfig(nested).type, 'fixed');
  assert.equal(getPriceInfo(nested, now).finalPrice, 200000);
  assert.equal(getPriceInfo({ ...nested, discount: { ...nested.discount, isActive: false } }, now).hasDiscount, false);
  assert.equal(getPriceInfo({ ...nested, discount: null }, now).hasDiscount, false, 'An explicit nested disabled value must not revive legacy fields');
});
test('discount dates are validated and interpreted consistently in Tashkent', () => {
  assert.equal(discountBoundary('2026-11-02T12:00:00'), now);
  assert.equal(discountBoundary('2026-11-02T07:00:00Z'), now);
  assert.equal(Number.isNaN(discountBoundary('2026-02-30')), true);
  assert.equal(getDiscountStatus({ ...product, discountEndsAt: 'invalid' }, now), 'invalid');
  assert.equal(getDiscountStatus({ ...product, discountStartsAt: '2026-11-03', discountEndsAt: '2026-11-02' }, now), 'invalid');
  assert.ok(formatDiscountEnd(product.discountEndsAt));
});
test('countdown uses the same inclusive expiration boundary as pricing', () => {
  const end = new Date(now + 90061000).toISOString();
  const countdown = getCountdown(end, now + 1);
  assert.equal(countdown.days, 1);
  assert.equal(countdown.hours, 1);
  assert.equal(countdown.minutes, 1);
  assert.equal(countdown.seconds, 1);
  assert.equal(getCountdown(product.discountEndsAt, now + 5000).ended, false);
  assert.equal(getCountdown(product.discountEndsAt, now + 5001).ended, true);
  assert.equal(getCountdown(null, now), null);
  assert.equal(getCountdown('invalid', now), null);
});
test('category and type filters combine; multiple product categories work', () => {
  assert.equal(filterDiscounts(fixtures, { category: 'kerama-granit' }, now).length, 2);
  assert.deepEqual(filterDiscounts(fixtures, { category: 'sokl', type: 'fixed' }, now), [fixtures[1]]);
  assert.equal(filterDiscounts(fixtures, { category: 'sokl', type: 'percentage' }, now).length, 0);
});
test('largest savings and upcoming endings sort active records only', () => {
  assert.equal(filterDiscounts(fixtures, { sort: 'largest' }, now)[0], product);
  assert.equal(filterDiscounts(fixtures, { sort: 'ending' }, now)[0], product);
  assert.deepEqual(filterDiscounts(fixtures, {}, now + 5001), [fixtures[1]]);
  assert.deepEqual(filterDiscounts(fixtures, {}, now + 10001), []);
});
test('card, calculator and Telegram text agree for flat and nested models', () => {
  for (const item of [product, fixtures[1], { ...product, discount: { type: 'percentage', value: 12.5, isActive: true } }]) {
    const card = getPriceInfo(item, now);
    const order = calculateOrder(item, { quantity: 1, now });
    assert.equal(card.finalPrice, order.total);
    assert.equal(card.discountAmount, order.discountAmount);
    const text = buildCalculatorOrderText(item, { quantity: 1, now, customer: { name: 'Test mijoz', phone: '901234567' } });
    assert.match(text, /Chegirma:/);
    assert.match(text, /Mijoz: Test mijoz/);
    if (item.discount) assert.match(text, /12.5%/);
  }
});
