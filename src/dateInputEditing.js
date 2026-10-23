import { formatUzDate, formatUzDateInput, parseUzDate } from './uzbekDate.js';

const digitPositions = [0, 1, 3, 4, 8, 9];
const caretPositions = [0, 1, 3, 4, 8, 9, 10];

/** Edit the six written digits while skipping separators and the fixed 20 prefix. */
export function editDateDigits(digits, { start, end = start, text = '', direction } = {}) {
  if (typeof digits !== 'string' || !/^\d{0,6}$/.test(digits)
    || typeof text !== 'string' || !/^\d*$/.test(text)
    || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start
    || (direction !== undefined && direction !== 'backward' && direction !== 'forward')
    || (direction !== undefined && text !== '')) return null;

  const displayLength = formatUzDateInput(digits).length;
  const selectionStart = Math.min(start, displayLength);
  const selectionEnd = Math.min(end, displayLength);
  const writtenPositions = digitPositions.slice(0, digits.length);
  let first = writtenPositions.filter((position) => position < selectionStart).length;
  let last = writtenPositions.filter((position) => position < selectionEnd).length;

  if (selectionStart === selectionEnd && direction === 'backward') {
    first = Math.max(0, first - 1);
  } else if (selectionStart === selectionEnd && direction === 'forward') {
    last = Math.min(digits.length, last + 1);
  }

  const next = digits.slice(0, first) + text + digits.slice(last);
  if (next.length > 6) return null;
  return { digits: next, caret: caretPositions[first + text.length] };
}

/** Accept complete pasted dates without losing digits or changing the century. */
export function dateDigitsFromDisplay(value) {
  if (typeof value !== 'string') return null;
  if (/^\d{6}$/.test(value)) return value;

  const iso = parseUzDate(value) || (formatUzDate(value) ? value : '');
  return iso ? `${iso.slice(8, 10)}${iso.slice(5, 7)}${iso.slice(2, 4)}` : null;
}
