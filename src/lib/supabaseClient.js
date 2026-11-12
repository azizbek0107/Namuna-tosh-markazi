import { createClient } from '@supabase/supabase-js';

// Read environment variables via Vite's import.meta.env
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL?.trim();
// Supports standard publishable key or legacy anon key
const supabaseKey = (
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env?.VITE_SUPABASE_ANON_KEY
)?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('example.com')
);

/**
 * Singleton Supabase client.
 * If credentials are not yet supplied in .env.local, returns a safe fallback dummy
 * so test suites and UI components mount gracefully with clear configuration warnings.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : {
      auth: {
        async getSession() {
          return { data: { session: null }, error: null };
        },
        async getUser() {
          return { data: { user: null }, error: null };
        },
        async signInWithPassword() {
          return {
            data: { user: null, session: null },
            error: new Error('Supabase loyihasi ulanmagan. Iltimos, .env.local faylida VITE_SUPABASE_URL va VITE_SUPABASE_PUBLISHABLE_KEY sozlamalarini kiriting.'),
          };
        },
        async signOut() {
          return { error: null };
        },
        async resetPasswordForEmail() {
          return {
            data: {},
            error: new Error('Supabase loyihasi ulanmagan.'),
          };
        },
        async updateUser() {
          return {
            data: { user: null },
            error: new Error('Supabase loyihasi ulanmagan.'),
          };
        },
        onAuthStateChange(callback) {
          return {
            data: {
              subscription: {
                unsubscribe() {},
              },
            },
          };
        },
      },
      async rpc() {
        return { data: false, error: new Error('Supabase ulanmagan') };
      },
      from() {
        return {
          select() {
            return {
              eq() {
                return {
                  async maybeSingle() {
                    return { data: null, error: null };
                  },
                };
              },
            };
          },
        };
      },
    };

