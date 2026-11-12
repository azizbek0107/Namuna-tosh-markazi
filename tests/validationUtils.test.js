// tests/validationUtils.test.js — standalone validation tests (no DOM required)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateName,
  validatePhone,
  validateComment,
  validateCustomerFields,
  isCustomerValid,
} from '../src/utils/validationUtils.js';

describe('validateName — edge cases', () => {
  it('trims before checking length', () => assert.ok(validateName(' A ')));
  it('accepts exactly 2 chars after trim', () => assert.equal(validateName('Ab'), null));
  it('accepts non-latin names', () => assert.equal(validateName('Али'), null));
  it('accepts exactly 100 chars', () => assert.equal(validateName('A'.repeat(100)), null));
});

describe('validatePhone — normalisation edge cases', () => {
  it('accepts phone with spaces and dashes', () => assert.equal(validatePhone('+998 90-123-45-67'), null));
  it('accepts phone with parentheses', () => assert.equal(validatePhone('+998(90)1234567'), null));
  it('rejects 8-digit local number (too short)', () => assert.ok(validatePhone('90123456')));
  it('rejects 10-digit number without country code', () => assert.ok(validatePhone('9981234567')));
  it('accepts 998 prefix without +', () => assert.equal(validatePhone('998901234567'), null));
});

describe('validateComment — boundary', () => {
  it('accepts null as empty', () => assert.equal(validateComment(null), null));
  it('accepts undefined', () => assert.equal(validateComment(undefined), null));
});

describe('isCustomerValid — combined', () => {
  const good = { name: 'Test User', phone: '+998901234567', comment: '' };
  it('is true for valid customer', () => assert.equal(isCustomerValid(good), true));
  it('is false when name is missing', () => assert.equal(isCustomerValid({ ...good, name: '' }), false));
  it('is false when phone is invalid', () => assert.equal(isCustomerValid({ ...good, phone: '1234' }), false));
  it('is false when comment too long', () => assert.equal(isCustomerValid({ ...good, comment: 'x'.repeat(1501) }), false));
});

