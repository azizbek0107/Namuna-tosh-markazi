import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const defaultAuthContext = {
  user: null,
  session: null,
  isAdmin: false,
  authStatus: 'unauthenticated',
  authError: null,
  isConfigured: false,
  isAuthenticated: false,
  loading: false,
  login: async () => ({ success: false, error: 'AuthProvider mavjud emas' }),
  logout: async () => ({ success: true }),
  requestPasswordReset: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
};

export default function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
}
