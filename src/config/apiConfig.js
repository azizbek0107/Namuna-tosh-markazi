/**
 * apiConfig.js
 * 
 * Configuration module for the StoneX ERP integration layer.
 * 
 * IMPORTANT ARCHITECTURAL & SECURITY RULES:
 * 1. StoneX ERP is the authoritative source for product IDs, names, dimensions, and prices.
 * 2. Never expose privileged ERP credentials (e.g. database passwords, admin tokens)
 *    in frontend Vite environment variables.
 * 3. Direct browser requests must only use public read-safe tokens or routes.
 *    Privileged writes should pass through a secure backend-for-frontend or ERP proxy.
 */

// Safely access Vite environment variables in both browser and Node test environments
const rawApiUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STONEX_ERP_API_URL) || '';
const rawPublicKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STONEX_ERP_PUBLIC_KEY) || '';

// Base URL for the StoneX ERP API (Live backend URL as standard fallback)
export const STONEX_ERP_API_URL = rawApiUrl.replace(/\/+$/, '') || 'https://stonex-erp-ppwx.onrender.com';

// Public client token (if ERP supports public read tokens for web catalogs)
export const STONEX_ERP_PUBLIC_KEY = rawPublicKey;

// Feature flag: whether ERP integration is actively configured
export const IS_ERP_CONFIGURED = Boolean(STONEX_ERP_API_URL);

// Standard credentials for ERP backend authentication
export const STONEX_ERP_DEFAULT_CREDENTIALS = {
  username: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STONEX_ERP_USERNAME) || 'admin',
  password: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STONEX_ERP_PASSWORD) || 'admin12345',
  role: 'admin',
};

// Request timeout in milliseconds (8 seconds)
export const API_TIMEOUT_MS = 8000;

// Maximum retry attempts for safe idempotent GET requests
export const API_MAX_RETRIES = 1;

// Price freshness cache TTL (60 seconds)
export const PRICE_CACHE_TTL_MS = 60000;

// Standard ERP Endpoints (contract specifications & live endpoints)
export const ERP_ENDPOINTS = {
  HEALTH: '/health',
  PING: '/ping',
  AUTH_LOGIN: '/auth/login',
  AUTH_TOKEN: '/auth/token',
  PRODUCTS: '/api/v1/products',
  PRODUCTS_LIST: '/products',
  PRODUCT_BY_ID: (id) => `/api/v1/products/${encodeURIComponent(id)}`,
  PRODUCT_BY_ID_LIVE: (id) => `/products/${encodeURIComponent(id)}`,
  PRODUCT_PRICING: (id) => `/api/v1/products/${encodeURIComponent(id)}/pricing`,
  CATEGORIES: '/api/v1/categories',
  STOCK_AVAILABILITY: (id) => `/api/v1/products/${encodeURIComponent(id)}/availability`,
  STOCK_SUMMARY: '/stock/summary',
  STOCK_MOVEMENTS: '/stock/movements',
  SALES: '/sales',
  CUSTOMERS: '/customers',
  ADMIN_PRICE_UPDATE: (id) => `/api/v1/admin/products/${encodeURIComponent(id)}/price`,
};

export default {
  STONEX_ERP_API_URL,
  STONEX_ERP_PUBLIC_KEY,
  IS_ERP_CONFIGURED,
  STONEX_ERP_DEFAULT_CREDENTIALS,
  API_TIMEOUT_MS,
  API_MAX_RETRIES,
  PRICE_CACHE_TTL_MS,
  ERP_ENDPOINTS,
};
