/**
 * apiErrorUtils.js
 * 
 * Sanitization, formatting, and categorization for StoneX ERP and web API errors.
 * Ensures all user-facing errors are presented in clear, respectful Uzbek language
 * without leaking internal server architecture, tokens, or database stack traces.
 */

export const ERROR_CODES = {
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  INVALID_DATA: 'INVALID_DATA',
  UNKNOWN: 'UNKNOWN'
};

const DEFAULT_MESSAGES_UZ = {
  [ERROR_CODES.NOT_CONFIGURED]: 'StoneX ERP tizimi hali to‘liq ulanmagan. Ma‘lumotlar mahalliy rejimda ko‘rsatilmoqda.',
  [ERROR_CODES.NETWORK_ERROR]: 'Server bilan aloqa vaqtincha mavjud emas. Internet aloqasini tekshiring.',
  [ERROR_CODES.TIMEOUT]: 'Serverdan javob kutish vaqti tugadi. Iltimos, qaytadan urinib ko‘ring.',
  [ERROR_CODES.UNAUTHORIZED]: 'Ushbu amalni bajarish uchun tizimga administrator sifatida kirishingiz zarur.',
  [ERROR_CODES.FORBIDDEN]: 'Ushbu operatsiyani bajarish uchun yetarli ruxsat mavjud emas.',
  [ERROR_CODES.NOT_FOUND]: 'So‘ralgan mahsulot yoki ma‘lumot tizimda topilmadi.',
  [ERROR_CODES.RATE_LIMITED]: 'So‘rovlar soni me’yordan oshdi. Biroz kuting va qayta urinib ko‘ring.',
  [ERROR_CODES.SERVER_ERROR]: 'ERP boshqaruv serverida vaqtinchalik nosozlik yuz berdi.',
  [ERROR_CODES.INVALID_DATA]: 'Yuborilgan ma‘lumotlar formati noto‘g‘ri yoki to‘liq emas.',
  [ERROR_CODES.UNKNOWN]: 'Kutilmagan xatolik yuz berdi. Iltimos, ma‘lumotlarni qayta yuklang.'
};

/**
 * Categorizes an HTTP status code or Error object into standard ERROR_CODES.
 */
export function categorizeError(error, status = null) {
  if (status === 401) return ERROR_CODES.UNAUTHORIZED;
  if (status === 403) return ERROR_CODES.FORBIDDEN;
  if (status === 404) return ERROR_CODES.NOT_FOUND;
  if (status === 429) return ERROR_CODES.RATE_LIMITED;
  if (status >= 500 && status < 600) return ERROR_CODES.SERVER_ERROR;

  if (error?.name === 'AbortError' || error?.message?.toLowerCase().includes('timeout')) {
    return ERROR_CODES.TIMEOUT;
  }

  if (error instanceof TypeError && (error.message?.includes('fetch') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch'))) {
    return ERROR_CODES.NETWORK_ERROR;
  }

  return ERROR_CODES.UNKNOWN;
}

/**
 * Returns a customer-safe Uzbek error message.
 * Strips out sensitive stack traces, DB connection strings, and tokens.
 */
export function formatApiError(error, status = null, customFallback = null) {
  const code = categorizeError(error, status);
  let message = customFallback || DEFAULT_MESSAGES_UZ[code] || DEFAULT_MESSAGES_UZ[ERROR_CODES.UNKNOWN];

  // If server provided a sanitized Uzbek message in payload, use it if safe
  if (error?.responseMessage && typeof error.responseMessage === 'string' && !isSensitive(error.responseMessage)) {
    message = error.responseMessage;
  }

  return {
    code,
    status,
    message,
    isTransient: code === ERROR_CODES.TIMEOUT || code === ERROR_CODES.NETWORK_ERROR || status === 503
  };
}

/**
 * Checks whether a text snippet contains sensitive developer/internal information.
 */
function isSensitive(text) {
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /sql/i,
    /syntax error/i,
    /at \w+\.\w+ \(/i, // Stack traces
    /\/home\//i,
    /c:\\/i
  ];
  return sensitivePatterns.some((pattern) => pattern.test(text));
}

export default {
  ERROR_CODES,
  categorizeError,
  formatApiError
};

