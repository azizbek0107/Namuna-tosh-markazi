import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Shield } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import useLanguage from '../../hooks/useLanguage';
import LoginForm from '../../components/Auth/LoginForm.jsx';
import AuthLoader from '../../components/Auth/AuthLoader.jsx';
import './AdminLogin.css';

export default function AdminLogin() {
  const { t } = useLanguage();
  const { authStatus, login, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated as admin, redirect to destination or dashboard
  useEffect(() => {
    if (authStatus === 'authorized') {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [authStatus, navigate, location.state]);

  if (authStatus === 'loading') {
    return (
      <div className="admin-login-page">
        <AuthLoader message="Tizim tekshirilmoqda..." />
      </div>
    );
  }

  async function handleLogin({ email, password }) {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setErrorMessage(result.error || 'Email yoki parol noto‘g‘ri.');
        return;
      }

      if (!result.isAdmin) {
        setErrorMessage('Ushbu hisob administrator huquqlariga ega emas.');
        return;
      }

      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch {
      setErrorMessage('Tizimga kirishda xatolik yuz berdi. Iltimos, qayta urinib ko‘rishdan oldin internet ulanishini tekshiring.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: reduced ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-login-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <Shield size={32} style={{ color: 'var(--gold-primary)' }} aria-hidden="true" />
          </div>
          <span className="admin-login-brand">{t('brand.title')}</span>
          <h1 className="admin-login-title">Admin panel</h1>
          <p className="admin-login-subtitle">Administrator boshqaruv paneli</p>
        </div>

        <div className="admin-notice">
          Kirish uchun administrator emaili va parolini kiriting. Ushbu sahifa tizimga kirmaguncha himoyalanmagan.
        </div>

        <LoginForm
          onSubmit={handleLogin}
          error={errorMessage}
          isSubmitting={isSubmitting}
        />
      </motion.div>
    </div>
  );
}
