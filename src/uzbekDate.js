import { validDay } from './attendance.js';

export function formatUzDateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 6);
  return digits.slice(0, 2) + (digits.length >= 2 ? '-' : '') + digits.slice(2, 4) + (digits.length >= 4 ? '-20' : '') + digits.slice(4, 6);
}

export function formatUzTimeInput(value) {
  if (typeof value !== 'string' || !/^(?:\d{0,4}|\d{2}:\d{0,2})$/.test(value)) return null;
  const digits = value.replace(':', '');
  return digits.length < 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function getTimeRangeError(value) {
  const formatted = formatUzTimeInput(value);
  if (formatted === null) return '';
  const digits = formatted.replace(':', '');
  const invalidHours = digits.length >= 2 && !/^([01]\d|2[0-3])$/.test(digits.slice(0, 2));
  const invalidMinutes = digits.length === 4 && !/^[0-5]\d$/.test(digits.slice(2));
  return invalidHours || invalidMinutes ? 'Soat 00–23, daqiqa 00–59 oralig‘ida bo‘lishi kerak.' : '';
}

export function formatUzDate(value) {
  return validDay(value) && value.startsWith('20') ? `${value.slice(8, 10)}-${value.slice(5, 7)}-${value.slice(0, 4)}` : '';
}

export function parseUzDate(value) {
  const match = /^(\d{2})-(\d{2})-(20\d{2})$/.exec(value);
  if (!match) return '';
  const day = `${match[3]}-${match[2]}-${match[1]}`;
  return validDay(day) ? day : '';
}

export function getDeliveryTimeError(date, time, now) {
  if (!validDay(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || !Number.isFinite(now)) return '';
  return Date.parse(`${date}T${time}:00+05:00`) < now ? 'Yetkazib berish vaqti hozirgi vaqtdan oldin bo‘lishi mumkin emas.' : '';
}
