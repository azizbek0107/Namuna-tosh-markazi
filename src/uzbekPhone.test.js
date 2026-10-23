import test from 'node:test';
import assert from 'node:assert/strict';
import { uzPhoneDigits, formatUzPhone, normalizeUzPhone } from './uzbekPhone.js';

test('phone digits separate the country prefix without dropping national digits', () => {
  for (const value of ['901234567', '90 123 45 67', '+998 (90) 123-45-67', '998901234567']) {
    assert.equal(uzPhoneDigits(value), '901234567', value);
  }
  assert.equal(uzPhoneDigits('+99890'), '90');
  assert.equal(uzPhoneDigits('998123456'), '998123456');
  assert.equal(uzPhoneDigits('+998998123456'), '998123456');
  assert.equal(uzPhoneDigits('9012345678'), '9012345678');
  assert.equal(uzPhoneDigits('+9989012345678'), '9012345678');
  assert.equal(uzPhoneDigits(''), '');
});

test('national phone display groups partial input and limits only the displayed digits', () => {
  const displays = [
    ['', ''], ['9', '9'], ['90', '90'], ['901', '90 1'],
    ['90123', '90 123'], ['901234', '90 123 4'],
    ['9012345', '90 123 45'], ['90123456', '90 123 45 6'],
    ['901234567', '90 123 45 67'],
  ];
  for (const [value, expected] of displays) assert.equal(formatUzPhone(value), expected, value);
  assert.equal(formatUzPhone('+998 (90) 123-45-67'), '90 123 45 67');
  assert.equal(formatUzPhone('9012345678'), '90 123 45 67');
  assert.equal(formatUzPhone('001234567'), '00 123 45 67');
});

test('complete local and Uzbekistan phone numbers normalize to one canonical value', () => {
  for (const value of ['901234567', '90 123 45 67', '+998901234567', '+998 (90) 123-45-67', '998901234567', '  +998 90 123 45 67  ']) {
    assert.equal(normalizeUzPhone(value), '+998901234567', value);
  }
  assert.equal(normalizeUzPhone('998123456'), '+998998123456');
  assert.equal(normalizeUzPhone('001234567'), '+998001234567');
});

test('incomplete, overlong, foreign and malformed phones cannot normalize to a valid number', () => {
  for (const value of [
    undefined, null, '', ' ', '+998', '90123456', '9012345678',
    '+99890123456', '+9989012345678', '9989012345678',
    '+7 90 123 45 67', '+1 (90) 123-45-67',
    'abc901234567', '90 123x45 67', '+998901234567ext',
    '+998+901234567', '9.01234567',
  ]) {
    assert.equal(normalizeUzPhone(value), null, String(value));
  }
});
