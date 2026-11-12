// Central contact configuration.
// All order components must import from here — never hardcode the Telegram username elsewhere.
export const TELEGRAM_USERNAME = 'aura_200707';
export const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME}`;

// Legacy alias kept for any existing imports; prefer TELEGRAM_URL going forward.
export const orderUrl = TELEGRAM_URL;

