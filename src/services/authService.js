import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const PRIMARY_ADMIN_EMAIL = 'aazimjonov90@gmail.com';
const PRIMARY_ADMIN_PASS = 'Azizbek0107';
const ADMIN_USER_ID = 'admin-aazimjonov-0107';
const ADMIN_SESSION_STORAGE_KEY = 'namuna_admin_active_session';

function getStoredAdminSession() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.user?.id === ADMIN_USER_ID && parsed?.user?.email === PRIMARY_ADMIN_EMAIL) {
      return parsed;
    }
  } catch {}
  return null;
}

function setStoredAdminSession(session) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (session) {
      window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    }
  } catch {}
}

export const authService = {
  isConfigured() {
    return isSupabaseConfigured;
  },

  async signInWithEmail(email, password) {
    const cleanEmail = email?.trim()?.toLowerCase();

    // 1. Primary Owner / Super Admin direct credentials
    if (cleanEmail === PRIMARY_ADMIN_EMAIL) {
      if (password === PRIMARY_ADMIN_PASS) {
        const adminUser = {
          id: ADMIN_USER_ID,
          email: PRIMARY_ADMIN_EMAIL,
          role: 'authenticated',
          app_metadata: { provider: 'email', role: 'super_admin' },
          user_metadata: { full_name: 'Azizbek', role: 'super_admin' },
          created_at: '2026-11-05T00:00:00.000Z',
        };
        const adminSession = {
          access_token: 'namuna-admin-token-aazimjonov-0107',
          token_type: 'bearer',
          expires_in: 86400 * 30,
          expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
          user: adminUser,
        };
        setStoredAdminSession(adminSession);
        return {
          user: adminUser,
          session: adminSession,
          error: null,
        };
      }
      return {
        user: null,
        session: null,
        error: 'Email yoki parol noto‘g‘ri.',
      };
    }

    // 2. Unconfigured fallback for general emails (exercises tests)
    if (!isSupabaseConfigured) {
      return {
        user: null,
        session: null,
        error: 'Supabase loyihasi ulanmagan. Iltimos, .env.local faylini sozlang.',
      };
    }

    // 3. Supabase server authentication
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return {
          user: null,
          session: null,
          error: 'Email yoki parol noto‘g‘ri.',
        };
      }
      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch {
      return {
        user: null,
        session: null,
        error: 'Tizimga kirishda kutilmagan xatolik yuz berdi.',
      };
    }
  },

  async signOut() {
    setStoredAdminSession(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err) {
      return { success: true, error: null };
    }
  },

  async sendPasswordResetEmail(email, redirectTo) {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase loyihasi ulanmagan.',
      };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectTo || `${window.location.origin}/admin/reset-password`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch {
      return {
        success: false,
        error: 'Parolni tiklash so‘rovini yuborishda xatolik yuz berdi.',
      };
    }
  },

  async updatePassword(newPassword) {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase loyihasi ulanmagan.',
      };
    }
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, user: data.user, error: null };
    } catch {
      return {
        success: false,
        error: 'Yangi parolni saqlashda xatolik yuz berdi.',
      };
    }
  },

  async checkIsAdmin(userId) {
    if (!userId) {
      return false;
    }
    if (userId === ADMIN_USER_ID) {
      return true;
    }
    if (!isSupabaseConfigured) {
      return false;
    }
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('is_admin');
      if (!rpcError && typeof rpcData === 'boolean') {
        return rpcData;
      }
      const { data: tableData, error: tableError } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('user_id', userId)
        .maybeSingle();
      if (!tableError && tableData && (tableData.role === 'admin' || tableData.role === 'super_admin')) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  async getSession() {
    const adminSession = getStoredAdminSession();
    if (adminSession) {
      return { session: adminSession, error: null };
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return { session: null, error };
      return { session: data.session, error: null };
    } catch (err) {
      return { session: null, error: err };
    }
  },
};

