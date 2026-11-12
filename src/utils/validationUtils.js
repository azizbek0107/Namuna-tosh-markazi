// Validation utilities for the order system.
// All validation messages are in Uzbek.

/** Validates a customer name. Returns an error string or null. */
export function validateName(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return "Ismingizni kiriting.";
  if (trimmed.length < 2) return "Ism kamida 2 ta belgidan iborat bo\u02BBlishi kerak.";
  if (trimmed.length > 100) return "Ism 100 ta belgidan oshmasligi kerak.";
  return null;
}

/** Validates an Uzbek phone number. Returns an error string or null. */
export function validatePhone(value) {
  const text = String(value ?? '').trim();
  if (!text) return "Telefon raqamingizni kiriting.";
  if (!/^\+?[\d\s()-]+$/.test(text)) return "Faqat raqam, +, bo\u02BBsh joy va () belgilariga ruxsat etiladi.";
  const digits = text.replace(/\D/g, '');
  const full = digits.length === 9 && !text.startsWith('+') ? `998${digits}` : digits;
  if (!/^998\d{9}$/.test(full)) return "Telefonni +998 90 123 45 67 ko\u02BBrinishida kiriting.";
  return null;
}

/** Validates a comment field. Returns an error string or null. */
export function validateComment(value) {
  const text = String(value ?? '');
  if (text.length > 1500) return "Izoh 1500 ta belgidan oshmasligi kerak.";
  return null;
}

/**
 * Validates the full customer object.
 * Returns an object of { field: errorString } — empty object means valid.
 */
export function validateCustomerFields(customer) {
  const errors = {};
  const nameErr = validateName(customer?.name);
  const phoneErr = validatePhone(customer?.phone);
  const commentErr = validateComment(customer?.comment);
  if (nameErr) errors.name = nameErr;
  if (phoneErr) errors.phone = phoneErr;
  if (commentErr) errors.comment = commentErr;
  return errors;
}

/** Returns true only when the customer object passes all validation. */
export function isCustomerValid(customer) {
  return Object.keys(validateCustomerFields(customer)).length === 0;
}
