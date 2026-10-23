import test from 'node:test';
import assert from 'node:assert/strict';
import { dateDigitsFromDisplay, editDateDigits } from './dateInputEditing.js';
import { formatUzDateInput } from './uzbekDate.js';

test('Backspace clears every written date digit while skipping the fixed century', () => {
  let digits = '251026';
  let caret = 10;
  for (const [expectedDigits, display, expectedCaret] of [
    ['25102', '25-10-202', 9],
    ['2510', '25-10-20', 8],
    ['251', '25-1', 4],
    ['25', '25-', 3],
    ['2', '2', 1],
    ['', '', 0],
  ]) {
    const edited = editDateDigits(digits, { start: caret, direction: 'backward' });
    assert.deepEqual(edited, { digits: expectedDigits, caret: expectedCaret });
    assert.equal(formatUzDateInput(edited.digits), display);
    ({ digits, caret } = edited);
  }
  assert.deepEqual(editDateDigits('', { start: 0, direction: 'backward' }), { digits: '', caret: 0 });
});

test('typing follows the separators and the immutable 20 prefix automatically', () => {
  let digits = '';
  let caret = 0;
  for (const [text, expectedDigits, expectedCaret] of [
    ['2', '2', 1], ['5', '25', 3], ['1', '251', 4],
    ['0', '2510', 8], ['2', '25102', 9], ['6', '251026', 10],
  ]) {
    const edited = editDateDigits(digits, { start: caret, text });
    assert.deepEqual(edited, { digits: expectedDigits, caret: expectedCaret });
    ({ digits, caret } = edited);
  }
});

test('forward Delete skips separators and century characters', () => {
  for (const [start, digits, caret] of [
    [0, '51026', 0], [2, '25026', 3], [5, '25106', 8],
    [6, '25106', 8], [7, '25106', 8], [8, '25106', 8],
    [9, '25102', 9], [10, '251026', 10],
  ]) {
    assert.deepEqual(editDateDigits('251026', { start, direction: 'forward' }), { digits, caret });
  }
  assert.deepEqual(editDateDigits('25', { start: 3, direction: 'forward' }), { digits: '25', caret: 3 });
});

test('selections delete only editable digits and never the fixed 20', () => {
  for (const direction of [undefined, 'backward', 'forward']) {
    assert.deepEqual(editDateDigits('251026', { start: 6, end: 8, direction }), { digits: '251026', caret: 8 });
    assert.deepEqual(editDateDigits('251026', { start: 8, end: 10, direction }), { digits: '2510', caret: 8 });
    assert.deepEqual(editDateDigits('251026', { start: 2, end: 3, direction }), { digits: '251026', caret: 3 });
    assert.deepEqual(editDateDigits('251026', { start: 3, end: 9, direction }), { digits: '256', caret: 3 });
  }
});

test('Ctrl+A clears or replaces the complete date including its visible prefix', () => {
  for (const direction of [undefined, 'backward', 'forward']) {
    assert.deepEqual(editDateDigits('251026', { start: 0, end: 10, direction }), { digits: '', caret: 0 });
  }
  assert.deepEqual(editDateDigits('251026', { start: 0, end: 10, text: '010127' }), { digits: '010127', caret: 10 });
  assert.deepEqual(editDateDigits('251026', { start: 0, end: 10, text: '3' }), { digits: '3', caret: 1 });
  assert.deepEqual(editDateDigits('', { start: 0, text: '251026' }), { digits: '251026', caret: 10 });
  assert.deepEqual(editDateDigits('251026', { start: 8, end: 10, text: '28' }), { digits: '251028', caret: 10 });
});

test('editing rejects overflow, malformed text and invalid selections without truncation', () => {
  for (const edit of [
    { start: 10, text: '7' },
    { start: 0, end: 10, text: '25102026' },
    { start: 0, end: 10, text: '25-10-2026' },
    { start: 8, end: 10, text: 'a6' },
    { start: 0, text: ' ' },
    { start: -1 }, { start: 2, end: 1 }, { start: 1.5 },
    { start: 1, direction: 'invalid' }, { start: 1, direction: 'backward', text: '2' },
  ]) assert.equal(editDateDigits('251026', edit), null, JSON.stringify(edit));
  for (const digits of [undefined, null, 251026, '2510267', '25-10-2026', 'abc']) {
    assert.equal(editDateDigits(digits, { start: 0 }), null, String(digits));
  }
});

test('complete valid pasted dates support Uzbek, ISO and raw editable digits', () => {
  for (const [input, expected] of [
    ['25-10-2026', '251026'], ['2026-10-25', '251026'], ['251026', '251026'],
    ['29-02-2028', '290228'], ['2028-02-29', '290228'],
    ['01-01-2000', '010100'], ['2099-12-31', '311299'],
  ]) assert.equal(dateDigitsFromDisplay(input), expected, input);
});

test('raw impossible dates retain all digits for validation, formatted invalid dates are rejected', () => {
  for (const digits of ['310426', '290227', '001026', '251326', '999999']) {
    assert.equal(dateDigitsFromDisplay(digits), digits);
    assert.equal(dateDigitsFromDisplay(formatUzDateInput(digits)), null);
  }
});

test('paste parsing rejects other centuries, extra digits, letters and partial dates', () => {
  for (const input of [
    undefined, null, false, 251026, '', '25', '25-', '25-10-20', '25-10-202',
    '25-10-1926', '1926-10-25', '25-10-2100', '2100-10-25',
    '25102026', '25-10-202026', '2510267', '25/10/2026',
    '25a1026', ' 251026', '251026 ', '2026-02-30', '31-04-2026',
  ]) assert.equal(dateDigitsFromDisplay(input), null, String(input));
});

