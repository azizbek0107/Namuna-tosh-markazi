// tests/orderUtils.test.js — unit tests for orderUtils.js and validationUtils.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── validationUtils ──────────────────────────────────────────────────────────
import {
  validateName,
  validatePhone,
  validateComment,
  validateCustomerFields,
  isCustomerValid,
} from '../src/utils/validationUtils.js';

describe('validateName', () => {
  it('returns error for empty string', () => assert.ok(validateName('')));
  it('returns error for whitespace only', () => assert.ok(validateName('   ')));
  it('returns error for single char', () => assert.ok(validateName('A')));
  it('returns null for valid name', () => assert.equal(validateName('Ali'), null));
  it('returns null for name with spaces', () => assert.equal(validateName('Ali Karimov'), null));
  it('returns error if over 100 chars', () => assert.ok(validateName('A'.repeat(101))));
});

describe('validatePhone', () => {
  it('returns error for empty', () => assert.ok(validatePhone('')));
  it('returns error for letters', () => assert.ok(validatePhone('abc')));
  it('returns null for +998 90 123 45 67', () => assert.equal(validatePhone('+998 90 123 45 67'), null));
  it('returns null for 9 digit local', () => assert.equal(validatePhone('901234567'), null));
  it('returns null for +998901234567', () => assert.equal(validatePhone('+998901234567'), null));
  it('returns error for too short', () => assert.ok(validatePhone('+998 90 123')));
  it('returns error for wrong country', () => assert.ok(validatePhone('+7 900 123 45 67')));
  it('returns null for formatted with dashes', () => assert.equal(validatePhone('+998-90-123-45-67'), null));
});

describe('validateComment', () => {
  it('returns null for empty comment', () => assert.equal(validateComment(''), null));
  it('returns null for valid comment', () => assert.equal(validateComment('Yetkazib bering.'), null));
  it('returns error for 1501+ chars', () => assert.ok(validateComment('x'.repeat(1501))));
  it('returns null for exactly 1500', () => assert.equal(validateComment('x'.repeat(1500)), null));
});

describe('validateCustomerFields', () => {
  it('returns empty object for valid customer', () => {
    const errs = validateCustomerFields({ name: 'Ali', phone: '+998901234567', comment: '' });
    assert.deepEqual(errs, {});
  });
  it('returns name and phone errors for empty customer', () => {
    const errs = validateCustomerFields({ name: '', phone: '', comment: '' });
    assert.ok(errs.name);
    assert.ok(errs.phone);
    assert.equal(errs.comment, undefined);
  });
});

describe('isCustomerValid', () => {
  it('returns true for valid customer', () => {
    assert.equal(isCustomerValid({ name: 'Sardor', phone: '901234567', comment: '' }), true);
  });
  it('returns false for missing phone', () => {
    assert.equal(isCustomerValid({ name: 'Sardor', phone: '', comment: '' }), false);
  });
});

// ── orderUtils ───────────────────────────────────────────────────────────────
import { buildOrderMessage, ORDER_STEPS, telegramUrl } from '../src/utils/orderUtils.js';

const baseProduct = {
  id: 'p1', name: 'Angola Black', slug: 'angola-black',
  category: 'kerama-granit', categories: ['kerama-granit'],
  description: 'Test product.',
  images: [],
  sizes: [{ widthCm: 60, lengthCm: 120, thicknessMm: 9 }],
  price: 250000,
  priceUnit: 'm2',
  discountType: null, discountValue: 0,
  orderConfig: { quantityModes: ['direct', 'pieces'], defaultQuantityMode: 'direct', linearLengthField: 'lengthCm' },
  discountStartsAt: null, discountEndsAt: null, discountIsActive: false,
  isVisible: true, isFeatured: true, createdAt: '2026-11-02',
};

const validCustomer = { name: 'Ali Karimov', phone: '+998901234567', comment: 'Tez yetkazing.' };
const selectedSize = baseProduct.sizes[0];

describe('buildOrderMessage', () => {
  it('returns empty string for null product', () => {
    assert.equal(buildOrderMessage(null), '');
  });

  it('returns empty string for invalid customer', () => {
    const msg = buildOrderMessage(baseProduct, { size: selectedSize, quantity: 2, mode: 'direct', customer: { name: '', phone: '', comment: '' } });
    assert.equal(msg, '');
  });

  it('returns non-empty string for valid inputs', () => {
    const msg = buildOrderMessage(baseProduct, { size: selectedSize, quantity: 2, mode: 'direct', customer: validCustomer });
    assert.ok(msg.length > 0);
  });

  it('includes product name', () => {
    const msg = buildOrderMessage(baseProduct, { size: selectedSize, quantity: 2, mode: 'direct', customer: validCustomer });
    assert.ok(msg.includes('Angola Black'));
  });

  it('includes customer name', () => {
    const msg = buildOrderMessage(baseProduct, { size: selectedSize, quantity: 2, mode: 'direct', customer: validCustomer });
    assert.ok(msg.includes('Ali Karimov'));
  });

  it('includes phone number', () => {
    const msg = buildOrderMessage(baseProduct, { size: selectedSize, quantity: 2, mode: 'direct', customer: validCustomer });
    assert.ok(msg.includes('+998901234567'));
  });

  it('includes comment when provided', () => {
    const msg = buildOrderMessage(baseProduct, { size: selectedSize, quantity: 2, mode: 'direct', customer: validCustomer });
    assert.ok(msg.includes('Tez yetkazing.'));
  });

  it('omits comment line when comment is empty', () => {
    const noComment = { ...validCustomer, comment: '' };
    const msg = buildOrderMessage(baseProduct, { size: selectedSize, quantity: 2, mode: 'direct', customer: noComment });
    assert.ok(!msg.includes('Izoh:'));
  });

  it('includes Narx: Kelishiladi when product price is null', () => {
    const unpriced = { ...baseProduct, price: null };
    const msg = buildOrderMessage(unpriced, { size: selectedSize, quantity: 2, mode: 'direct', customer: validCustomer });
    assert.ok(msg.includes('Kelishiladi'));
  });

  it('includes thickness when size has thicknessMm > 0', () => {
    const msg = buildOrderMessage(baseProduct, { size: selectedSize, quantity: 1, mode: 'direct', customer: validCustomer });
    assert.ok(msg.includes('9 mm'));
  });

  it('does not include discount lines when no discount is active', () => {
    const msg = buildOrderMessage(baseProduct, { size: selectedSize, quantity: 2, mode: 'direct', customer: validCustomer });
    assert.ok(!msg.includes('Chegirma:'));
  });
});

describe('ORDER_STEPS', () => {
  it('has expected step keys', () => {
    assert.equal(ORDER_STEPS.EDITING, 'editing');
    assert.equal(ORDER_STEPS.REVIEW, 'review');
    assert.equal(ORDER_STEPS.READY, 'ready_to_copy');
    assert.equal(ORDER_STEPS.COPIED, 'copied');
    assert.equal(ORDER_STEPS.TELEGRAM_OPENED, 'telegram_opened');
  });
});

describe('telegramUrl', () => {
  it('points to aura_200707', () => {
    assert.ok(telegramUrl.includes('aura_200707'));
    assert.ok(telegramUrl.startsWith('https://t.me/'));
  });
});

