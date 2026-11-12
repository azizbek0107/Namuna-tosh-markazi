import { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { authService } from '../services/authService.js';

export const AuthContext = createContext(null);

/**
 * Authorization states:
 * - 'loading': session is being validated
 * - 'unauthenticated': no active user session
 * - 'unauthorized': valid user session, but lacks server admin privileges
 * - 'authorized': verified administrator
 * - 'error': unexpected authentication failure
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authStatus, setAuthStatus] = useState('loading');
  const [authError, setAuthError] = useState(null);

  // Verifies whether an active user has server-enforced admin privileges
  const verifyAdminPrivileges = useCallback(async (activeUser) => {
    if (!activeUser) {
      setIsAdmin(false);
      setAuthStatus('unauthenticated');
      return false;
    }

    try {
      const authorized = await authService.checkIsAdmin(activeUser.id);
      setIsAdmin(authorized);
      setAuthStatus(authorized ? 'authorized' : 'unauthorized');
      return authorized;
    } catch {
      setIsAdmin(false);
      setAuthStatus('error');
      return false;
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setAuthStatus('loading');
      setAuthError(null);

      // Discard old local test sessions; only the authentication server can grant access.
      try { window.localStorage?.removeItem('namuna_mock_admin_session'); } catch {}
      try { window.sessionStorage?.removeItem('namuna_mock_admin_session'); } catch {}

      const { session: currentSession, error } = await authService.getSession();

      if (!isMounted) return;

      if (error) {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthStatus('unauthenticated');
        return;
      }

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        await verifyAdminPrivileges(currentSession.user);
      } else {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthStatus('unauthenticated');
      }
    }

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthStatus('unauthenticated');
        setAuthError(null);
      } else if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await verifyAdminPrivileges(newSession.user);
      } else {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthStatus('unauthenticated');
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, [verifyAdminPrivileges]);

  // Login handler
  const login = useCallback(async (email, password) => {
    setAuthError(null);

    const result = await authService.signInWithEmail(email, password);

    if (result.error) {
      setAuthError(result.error);
      return { success: false, error: result.error };
    }

    setSession(result.session);
    setUser(result.user);
    const authorized = await verifyAdminPrivileges(result.user);

    return {
      success: true,
      isAdmin: authorized,
      user: result.user,
    };
  }, [verifyAdminPrivileges]);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      window.localStorage?.removeItem('namuna_mock_admin_session');
      window.sessionStorage?.removeItem('namuna_mock_admin_session');
    } catch {}
    const result = await authService.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setAuthStatus('unauthenticated');
    setAuthError(null);
    return result;
  }, []);

  // Password recovery request
  const requestPasswordReset = useCallback(async (email, redirectTo) => {
    return authService.sendPasswordResetEmail(email, redirectTo);
  }, []);

  // Password update
  const resetPassword = useCallback(async (newPassword) => {
    return authService.updatePassword(newPassword);
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    isAdmin,
    authStatus,
    authError,
    isConfigured: isSupabaseConfigured,
    isAuthenticated: authStatus === 'authorized',
    loading: authStatus === 'loading',
    login,
    logout,
    requestPasswordReset,
    resetPassword,
  }), [user, session, isAdmin, authStatus, authError, login, logout, requestPasswordReset, resetPassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
