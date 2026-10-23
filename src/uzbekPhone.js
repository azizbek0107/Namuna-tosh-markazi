export function uzPhoneDigits(value) {
  const text = String(value ?? '').trim();
  const digits = text.replace(/\D/g, '');
  return digits.startsWith('998') && (text.startsWith('+') || digits.length === 12) ? digits.slice(3) : digits;
}

export function formatUzPhone(value) {
  const digits = uzPhoneDigits(value).slice(0, 9);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' ');
}

export function normalizeUzPhone(value) {
  const text = String(value ?? '').trim();
  if (!/^\+?[\d\s()-]+$/.test(text)) return null;
  if (text.startsWith('+') && !text.replace(/\D/g, '').startsWith('998')) return null;
  const digits = uzPhoneDigits(text);
  return /^\d{9}$/.test(digits) ? `+998${digits}` : null;
}
