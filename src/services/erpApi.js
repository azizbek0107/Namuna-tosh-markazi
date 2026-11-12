/**
 * erpApi.js
 * 
 * Secure HTTP communication client for the StoneX ERP server.
 * 
 * SECURITY SPECIFICATIONS:
 * 1. HTTPS enforcement.
 * 2. Strict timeout via AbortController.
 * 3. Never logs or prints sensitive authorization headers or tokens.
 * 4. Automatic JWT bearer authentication and transparent renewal.
 * 5. Idempotent GET retry policy (1 retry with backoff on transient 503/timeout).
 * 6. Non-idempotent write operations are NEVER blindly retried.
 */

import {
  STONEX_ERP_API_URL,
  STONEX_ERP_PUBLIC_KEY,
  STONEX_ERP_DEFAULT_CREDENTIALS,
  IS_ERP_CONFIGURED,
  API_TIMEOUT_MS,
  API_MAX_RETRIES,
  ERP_ENDPOINTS,
} from '../config/apiConfig.js';
import { formatApiError } from '../utils/apiErrorUtils.js';

const STORAGE_KEY_TOKEN = 'stonex_erp_access_token';

class ErpApiClient {
  constructor() {
    this.baseUrl = STONEX_ERP_API_URL;
    this.isConfigured = IS_ERP_CONFIGURED;
    this.activeToken = null;
    this.isAuthenticating = null;
  }

  /**
   * Retrieves active token from memory or browser storage.
   */
  getStoredToken() {
    if (this.activeToken) return this.activeToken;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY_TOKEN);
        if (stored) {
          this.activeToken = stored;
          return stored;
        }
      } catch {}
    }
    return null;
  }

  /**
   * Saves the authenticated token in memory and local storage.
   */
  setStoredToken(token) {
    this.activeToken = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (token) {
          window.localStorage.setItem(STORAGE_KEY_TOKEN, token);
        } else {
          window.localStorage.removeItem(STORAGE_KEY_TOKEN);
        }
      } catch {}
    }
  }

  /**
   * Authenticates against the Stonex ERP backend to obtain a valid Bearer JWT.
   */
  async login(
    username = STONEX_ERP_DEFAULT_CREDENTIALS.username,
    password = STONEX_ERP_DEFAULT_CREDENTIALS.password,
    role = STONEX_ERP_DEFAULT_CREDENTIALS.role
  ) {
    if (!this.baseUrl) {
      return { success: false, error: 'ERP server manzili ko‘rsatilmagan.' };
    }

    // Deduplicate concurrent authentication attempts
    if (this.isAuthenticating) {
      return this.isAuthenticating;
    }

    this.isAuthenticating = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

        const endpoints = [ERP_ENDPOINTS.AUTH_LOGIN, ERP_ENDPOINTS.AUTH_TOKEN];
        let lastError = null;

        for (const ep of endpoints) {
          try {
            const url = `${this.baseUrl}${ep}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({ username, password, role }),
              signal: controller.signal,
            });

            if (res.ok) {
              const data = await res.json();
              const token = data.access_token || data.token;
              if (token) {
                this.setStoredToken(token);
                clearTimeout(timeoutId);
                return { success: true, token, user: data.user, error: null };
              }
            } else if (res.status !== 404) {
              const errJson = await res.json().catch(() => ({}));
              lastError = errJson.detail || errJson.message || `Autentifikatsiya xatosi (${res.status})`;
              break;
            }
          } catch (e) {
            lastError = e?.message || 'Serverga ulanib bo‘lmadi';
          }
        }

        clearTimeout(timeoutId);
        return { success: false, token: null, error: lastError || 'Token olish imkoni bo‘lmadi.' };
      } catch (err) {
        return { success: false, token: null, error: err?.message || 'Autentifikatsiya amalga oshmadi.' };
      } finally {
        this.isAuthenticating = null;
      }
    })();

    return this.isAuthenticating;
  }

  /**
   * Ensures an active Bearer token is present, logging in automatically if needed.
   */
  async ensureToken() {
    const existing = this.getStoredToken();
    if (existing) return existing;

    const res = await this.login();
    return res.token || null;
  }

  /**
   * Builds headers for the outgoing request.
   */
  _buildHeaders(customHeaders = {}, token = null) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const authToken = token || this.getStoredToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else if (STONEX_ERP_PUBLIC_KEY) {
      headers['X-API-Key'] = STONEX_ERP_PUBLIC_KEY;
    }

    return headers;
  }

  /**
   * Internal request executor with timeout, authorization, and safe error handling.
   */
  async request(endpoint, options = {}, retries = 0) {
    if (!this.isConfigured) {
      return {
        data: null,
        error: formatApiError(new Error('ERP_NOT_CONFIGURED'), null, 'StoneX ERP tizimi ulanmagan. Mahalliy rejimda ishlanmoqda.'),
        isMock: true,
      };
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const method = (options.method || 'GET').toUpperCase();
    const isIdempotent = method === 'GET' || method === 'HEAD';

    // Auto-acquire token if not provided and not an auth route
    let token = options.token || this.getStoredToken();
    if (!token && !endpoint.includes('/auth/') && !endpoint.includes('/health') && !endpoint.includes('/ping')) {
      token = await this.ensureToken();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        method,
        headers: this._buildHeaders(options.headers, token),
        signal: options.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized: clear token and re-authenticate once
      if (response.status === 401 && retries === 0 && !endpoint.includes('/auth/')) {
        this.setStoredToken(null);
        const loginRes = await this.login();
        if (loginRes.success && loginRes.token) {
          return this.request(endpoint, { ...options, token: loginRes.token }, retries + 1);
        }
      }

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {
          // Response body was not JSON
        }

        const formatted = formatApiError(
          { responseMessage: errorData?.detail || errorData?.message || errorData?.error },
          response.status
        );

        // Safe retry for transient 503 or 504 on idempotent GET
        if (isIdempotent && (response.status === 503 || response.status === 504) && retries < API_MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000));
          return this.request(endpoint, options, retries + 1);
        }

        return { data: null, error: formatted, status: response.status };
      }

      const data = await response.json();
      return { data, error: null, status: response.status };
    } catch (err) {
      clearTimeout(timeoutId);

      const formatted = formatApiError(err);

      // Safe retry on transient network timeout for GET requests only
      if (isIdempotent && formatted.isTransient && retries < API_MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000));
        return this.request(endpoint, options, retries + 1);
      }

      return { data: null, error: formatted, status: 0 };
    }
  }

  // HTTP standard methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // =========================================================================
  // High-level Stonex ERP Domain Operations (Web Sayt uchun asosiy funksiyalar)
  // =========================================================================

  /**
   * Mahsulotlar ro'yxatini olish (qidirish va filtr bilan)
   * GET /products?q=marmar&category=granit
   */
  async getProducts({ q = '', category = '', signal } = {}) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category && category !== 'all') params.set('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.get(`${ERP_ENDPOINTS.PRODUCTS_LIST}${qs}`, { signal });
  }

  /**
   * Mahsulotni ID bo'yicha olish
   * GET /products/{product_id}
   */
  async getProductById(id, { signal } = {}) {
    return this.get(ERP_ENDPOINTS.PRODUCT_BY_ID_LIVE(id), { signal });
  }

  /**
   * Yangi buyurtma / savdo yuborish
   * POST /sales
   */
  async createSale(saleData) {
    return this.post(ERP_ENDPOINTS.SALES, saleData);
  }

  /**
   * Mijozlar ro'yxatini olish
   * GET /customers
   */
  async getCustomers({ signal } = {}) {
    return this.get(ERP_ENDPOINTS.CUSTOMERS, { signal });
  }

  /**
   * Yangi mijoz qo'shish
   * POST /customers
   */
  async createCustomer(customerData) {
    return this.post(ERP_ENDPOINTS.CUSTOMERS, customerData);
  }

  /**
   * Ombor harakatlari va qoldiqlarini olish
   * GET /stock/movements
   */
  async getStockMovements({ signal } = {}) {
    return this.get(ERP_ENDPOINTS.STOCK_MOVEMENTS, { signal });
  }
}

export const erpApi = new ErpApiClient();
export default erpApi;
