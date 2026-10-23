import test from 'node:test';
import assert from 'node:assert/strict';
import { formatUzDate, formatUzDateInput, formatUzTimeInput, getTimeRangeError, parseUzDate, getDeliveryTimeError } from './uzbekDate.js';

test('Uzbek date display and parsing round trip the full four digit year', () => {
  for (const [iso, displayed] of [
    ['2026-10-25', '25-10-2026'],
    ['2028-02-29', '29-02-2028'],
    ['2000-02-29', '29-02-2000'],
    ['2099-12-31', '31-12-2099'],
  ]) {
    assert.equal(formatUzDate(iso), displayed);
    assert.equal(parseUzDate(displayed), iso);
  }
});

test('date parser rejects partial, impossible and non-20xx dates', () => {
  for (const value of [undefined, null, '', '25-', '25-10-20', '25-10-202', '25-10-26', '25/10/2026', '2026-10-25', '5-10-2026', '25-1-2026', '31-04-2026', '29-02-2027', '00-10-2026', '25-00-2026', '25-13-2026', '25-10-1926', '25-10-2100', '25-10-202026']) {
    assert.equal(parseUzDate(value), '', String(value));
  }
  for (const value of ['', undefined, null, 'invalid', '2026-02-30']) assert.equal(formatUzDate(value), '', String(value));
});

test('editable date digits insert separators and the immutable 20 year prefix', () => {
  for (const [digits, expected] of [
    ['', ''], ['2', '2'], ['25', '25-'], ['251', '25-1'],
    ['2510', '25-10-20'], ['25102', '25-10-202'], ['251026', '25-10-2026'],
    ['010100', '01-01-2000'], ['311299', '31-12-2099'],
  ]) {
    assert.equal(formatUzDateInput(digits), expected, digits);
  }
  assert.equal(parseUzDate(formatUzDateInput('290228')), '2028-02-29');
  assert.equal(parseUzDate(formatUzDateInput('290227')), '');
});

test('time input inserts a colon immediately after two digits and preserves typing states', () => {
  for (const [value, expected] of [
    ['', ''], ['1', '1'], ['14', '14:'], ['143', '14:3'], ['1430', '14:30'],
    ['14:', '14:'], ['14:3', '14:3'], ['14:30', '14:30'],
    ['0', '0'], ['00', '00:'], ['000', '00:0'], ['0000', '00:00'],
    ['00:00', '00:00'], ['2359', '23:59'], ['23:59', '23:59'],
  ]) {
    assert.equal(formatUzTimeInput(value), expected, value);
  }
});

test('time input does not truncate malformed values or accept seconds', () => {
  for (const value of [
    undefined, null, false, 1430, ['1430'], {},
    'abc', '14a30', ' 1430', '1430 ', '14 30', '14\t30',
    ':', ':1430', '1:', '1:430', '143:0', '14::30', '14/30', '14-30',
    '14300', '143000', '14:300', '14:30:', '14:30:00',
  ]) {
    assert.equal(formatUzTimeInput(value), null, String(value));
  }
});

test('time formatting preserves out of range digits for visible validation', () => {
  for (const [value, expected] of [['24', '24:'], ['2499', '24:99'], ['24:99', '24:99'], ['2360', '23:60'], ['9999', '99:99']]) {
    assert.equal(formatUzTimeInput(value), expected, value);
  }
});

test('time range errors wait for complete hour or minute digits', () => {
  for (const value of ['', '0', '2', '23', '23:', '23:6', '236', '00:5']) {
    assert.equal(getTimeRangeError(value), '', value);
  }
  const error = 'Soat 00–23, daqiqa 00–59 oralig‘ida bo‘lishi kerak.';
  for (const value of ['24', '24:', '24:0', '24:00', '2400', '99:', '12:60', '1260', '23:99', '2499']) {
    assert.equal(getTimeRangeError(value), error, value);
  }
});

test('valid midnight, boundary and ordinary times have no range error', () => {
  for (const value of ['0000', '00:00', '2359', '23:59', '0905', '09:05', '14:30']) {
    assert.equal(getTimeRangeError(value), '', value);
  }
});

test('time range validation leaves malformed values to format validation', () => {
  for (const value of [undefined, null, false, 2400, {}, 'invalid', '24::00', '14:30:00', '14 30', '23590']) {
    assert.equal(getTimeRangeError(value), '', String(value));
  }
});

test('delivery time errors compare exact Tashkent instants with equality allowed', () => {
  const now = Date.parse('2026-10-22T10:00:00.000Z');
  assert.notEqual(getDeliveryTimeError('2026-10-22', '14:59', now), '');
  assert.equal(getDeliveryTimeError('2026-10-22', '15:00', now), '');
  assert.equal(getDeliveryTimeError('2026-10-22', '15:01', now), '');
  assert.notEqual(getDeliveryTimeError('2026-10-22', '15:00', now + 1), '');
  assert.equal(getDeliveryTimeError('2026-10-22', '15:01', now + 59999), '');
});

test('delivery time validation follows the Tashkent day rollover', () => {
  const midnight = Date.parse('2026-10-22T19:00:00.000Z');
  assert.notEqual(getDeliveryTimeError('2026-10-22', '23:59', midnight), '');
  assert.equal(getDeliveryTimeError('2026-10-23', '00:00', midnight), '');
  assert.equal(getDeliveryTimeError('2026-10-23', '00:00', midnight - 1), '');
  assert.notEqual(getDeliveryTimeError('2026-10-23', '00:00', midnight + 1), '');
});

test('past-time validation leaves empty and malformed values to required and format validation', () => {
  const now = Date.parse('2026-10-22T10:00:00.000Z');
  for (const date of [undefined, null, '', 'invalid', '22-10-2026', '2026-02-30']) {
    assert.equal(getDeliveryTimeError(date, '15:00', now), '', String(date));
  }
  for (const time of [undefined, null, '', 'invalid', '9:05', '09:5', '24:00', '23:60', '15:00:00']) {
    assert.equal(getDeliveryTimeError('2026-10-22', time, now), '', String(time));
  }
});
