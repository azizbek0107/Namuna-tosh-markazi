import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import AuthLoader from './AuthLoader.jsx';

export default function ProtectedRoute() {
  const { user, isAdmin, authStatus, logout } = useAuth();
  const location = useLocation();

  if (authStatus === 'loading') {
    return <AuthLoader message="Autentifikatsiya tekshirilmoqda..." />;
  }

  // Not signed in -> redirect to login preserving intent
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Signed in, but server authorization failed (not an admin)
  if (!isAdmin || authStatus !== 'authorized') {
    return (
      <div className="admin-page container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <ShieldAlert size={48} style={{ color: '#e05555', margin: '0 auto 16px' }} aria-hidden="true" />
        <span className="page-eyebrow" style={{ color: '#e05555' }}>RUXSAT CHEKLANGAN</span>
        <h1 style={{ marginTop: '12px' }}>Kirish taqiqlangan</h1>
        <p style={{ maxWidth: '480px', margin: '12px auto 24px', color: 'var(--text-secondary)' }}>
          Ushbu hisob ({user.email}) tizim administratorligi uchun tasdiqlanmagan.
          Faqat server tomonidan vakolat berilgan administratorlar ushbu bo\u02BBlimga kira oladi.
        </p>
        <button
          type="button"
          onClick={logout}
          className="gold-button"
          style={{ margin: '0 auto' }}
        >
          <LogOut size={16} aria-hidden="true" />
          Tizimdan chiqish
        </button>
      </div>
    );
  }

  // Authorized administrator
  return <Outlet />;
}

