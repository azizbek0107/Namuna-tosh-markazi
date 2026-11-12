import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateOrder, normalizeUzPhone, plateArea, validateCustomer } from '../src/utils/calculatorUtils.js';
import { buildCalculatorOrderText } from '../src/utils/telegramUtils.js';
import { calculateTotal } from '../src/utils/priceUtils.js';

const size = { lengthCm: 120, widthCm: 60, thicknessMm: 9 };
const product = { name: 'Test plita', price: 250000, priceUnit: 'm2', sizes: [size], discountType: null, discountValue: 0 };
const now = Date.parse('2026-11-02T12:00:00+05:00');
const options = { size, quantity: 20, mode: 'pieces', now };
const customer = { name: 'Ali', phone: '+998 90 123 45 67', comment: 'Yetkazib berish kerak.' };

test('piece orders multiply unit price by an integer count', () => {
  const result = calculateOrder({ ...product, priceUnit: 'piece' }, { quantity: 3 });
  assert.equal(result.valid, true);
  assert.equal(result.measurement, 3);
  assert.equal(result.total, 750000);
  assert.equal(calculateOrder({ ...product, priceUnit: 'piece' }, { quantity: 1.5 }).valid, false);
});
test('120 × 60 cm, 20 pieces produces 14.4 m²', () => {
  const result = calculateOrder(product, options);
  assert.equal(plateArea(size), 0.72);
  assert.equal(result.measurement, 14.4);
  assert.equal(result.total, 3600000);
});
test('direct area quantities allow decimals without requiring dimensions', () => {
  const result = calculateOrder({ ...product, sizes: [] }, { quantity: '2.50', mode: 'direct' });
  assert.equal(result.measurement, 2.5);
  assert.equal(result.total, 625000);
  assert.equal(calculateOrder(product, { quantity: '1.001', mode: 'direct' }).valid, false);
});
test('linear metres use lengthCm explicitly, never widthCm by accident', () => {
  const linear = { ...product, priceUnit: 'linear_m', price: 50000 };
  assert.equal(calculateOrder(linear, options).measurement, 24);
  assert.equal(calculateOrder(linear, options).total, 1200000);
  assert.equal(calculateOrder({ ...linear, orderConfig: { linearLengthField: 'widthCm' } }, options).measurement, 12);
  assert.equal(calculateOrder({ ...linear, orderConfig: { linearLengthField: 'other' } }, options).valid, false);
});
test('direct linear metre quantities support fractional input', () => {
  const result = calculateOrder({ ...product, priceUnit: 'linear_m', price: 50000, sizes: [] }, { mode: 'direct', quantity: 2.75 });
  assert.equal(result.total, 137500);
  assert.equal(result.measurement, 2.75);
});
test('percentage discount applies to the complete order', () => {
  const result = calculateOrder({ ...product, discountType: 'percentage', discountValue: 10 }, options);
  assert.equal(result.subtotal, 3600000);
  assert.equal(result.discountAmount, 360000);
  assert.equal(result.total, 3240000);
});
test('fixed discount applies once per order rather than once per piece/unit', () => {
  const discounted = { ...product, discountType: 'fixed', discountValue: 50000 };
  assert.equal(calculateOrder(discounted, options).total, 3550000);
  assert.equal(calculateTotal(discounted, 2, now), 450000);
});
test('unpriced products still calculate area and length', () => {
  const result = calculateOrder({ ...product, price: null, discountType: 'fixed', discountValue: 50000 }, options);
  assert.equal(result.valid, true);
  assert.equal(result.measurement, 14.4);
  assert.equal(result.total, null);
  assert.equal(result.hasDiscount, false);
});
for (const quantity of [0, -1, '', 'text', Infinity, NaN]) {
  test(`invalid quantity is rejected: ${String(quantity)}`, () => {
    assert.equal(calculateOrder(product, { ...options, quantity }).valid, false);
    assert.equal(buildCalculatorOrderText(product, { ...options, quantity, customer }), '');
  });
}
test('missing, malformed and unlisted sizes cannot be used for conversion', () => {
  for (const invalid of [null, { lengthCm: 120 }, { lengthCm: -1, widthCm: 60 }, { lengthCm: 60, widthCm: 60 }]) {
    assert.equal(calculateOrder(product, { ...options, size: invalid }).valid, false);
  }
  const malformed = { lengthCm: 0, widthCm: 60 };
  assert.equal(calculateOrder({ ...product, sizes: [malformed] }, { ...options, size: malformed }).valid, false);
});
test('discount cannot exceed subtotal or create a negative amount', () => {
  for (const discountType of ['fixed', 'percentage']) {
    const result = calculateOrder({ ...product, discountType, discountValue: 99999999 }, options);
    assert.equal(result.total, 0);
    assert.equal(result.discountAmount, result.subtotal);
  }
});
test('expired, future, malformed and reversed discount windows are inactive', () => {
  for (const dates of [
    { discountEndsAt: '2026-11-01' }, { discountStartsAt: '2026-11-03' },
    { discountStartsAt: 'invalid' }, { discountStartsAt: '2026-11-03', discountEndsAt: '2026-11-01' },
  ]) {
    const result = calculateOrder({ ...product, discountType: 'percentage', discountValue: 10, ...dates }, options);
    assert.equal(result.hasDiscount, false);
    assert.equal(result.total, 3600000);
  }
  const active = { ...product, discountType: 'percentage', discountValue: 10, discountStartsAt: '2026-11-02', discountEndsAt: '2026-11-02' };
  for (const date of ['2026-11-02T00:00:00+05:00', '2026-11-02T23:59:59.999+05:00']) {
    assert.equal(calculateOrder(active, { ...options, now: Date.parse(date) }).hasDiscount, true);
  }
});
test('decimal money is rounded once to cents with no binary multiplication error', () => {
  assert.equal(calculateOrder({ ...product, price: 0.1 }, { quantity: 3 }).total, 0.3);
  assert.equal(calculateOrder({ ...product, price: 1.005 }, { quantity: 1 }).total, 1.01);
  assert.equal(calculateOrder({ ...product, price: 0.29 }, { quantity: 3 }).total, 0.87);
  assert.equal(calculateOrder({ ...product, price: Number.MAX_SAFE_INTEGER }, { quantity: 2 }).valid, false);
});
test('business can explicitly restrict direct measurement entry', () => {
  const restricted = { ...product, orderConfig: { quantityModes: ['pieces'] } };
  assert.equal(calculateOrder(restricted, { mode: 'direct', quantity: 2 }).valid, false);
  assert.equal(calculateOrder(restricted, options).valid, true);
});
test('Uzbek phone and required name validation permits natural phone typing', () => {
  for (const phone of ['+998 90 123 45 67', '998901234567', '(90) 123-45-67']) assert.equal(normalizeUzPhone(phone), '+998901234567');
  for (const phone of ['', '+998 90', '+7 901 234 56 78', '+998901234567abc']) assert.equal(normalizeUzPhone(phone), null);
  assert.deepEqual(validateCustomer(customer), {});
  assert.equal(Object.keys(validateCustomer({ name: ' ', phone: '' })).length, 2);
});
test('Telegram preview uses actual size, quantity, total discount and customer data', () => {
  const text = buildCalculatorOrderText({ ...product, discountType: 'percentage', discountValue: 10 }, { ...options, customer });
  for (const expected of ['NAMUNA TOSH MARKAZI — YANGI BUYURTMA', '60 × 120 cm', '20 dona', '14,4 m²', '250 000 so‘m / m²', '10%', '3 240 000 so‘m', 'Mijoz: Ali', 'Telefon: +998901234567', customer.comment]) assert.ok(text.includes(expected), expected);
  const unknown = buildCalculatorOrderText({ ...product, price: null }, { ...options, customer });
  assert.match(unknown, /Jami: Narx so‘rov asosida/);
  assert.equal(buildCalculatorOrderText(product, { ...options, customer: { name: '', phone: '' } }), '');
});
