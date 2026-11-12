import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import useAuth from '../../hooks/useAuth.js';
import PasswordInput from './PasswordInput.jsx';
import './ResetPassword.css';

export default function ResetPassword() {
  const { resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reduced = useReducedMotion();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!password) {
      setError('Yangi parolni kiriting.');
      return;
    }
    if (password.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo\u02BBlishi kerak.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Kiritilgan parollar bir-biriga mos kelmadi.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await resetPassword(password);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      }
    } catch {
      setError('Parolni yangilashda xatolik yuz berdi. Iltimos, qaytadan urinib ko\u02BBrish uchun tiklash havolasini yangilang.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
      <motion.div
        className="auth-card-wide"
        initial={{ opacity: 0, y: reduced ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.3 }}
      >
        <div className="auth-card-header">
          <span className="page-eyebrow" style={{ justifyContent: 'center' }}>
            <span /> XAVFSIZLIK
          </span>
          <h2>Yangi parol o\u02BBrnatish</h2>
          <p>Hisobingiz uchun yangi va mustahkam parol tanlang.</p>
        </div>

        {success ? (
          <div className="auth-success-banner" role="status">
            <CheckCircle size={28} style={{ margin: '0 auto 8px', color: '#6abf6e' }} aria-hidden="true" />
            <p><strong>Parol muvaffaqiyatli yangilandi!</strong></p>
            <p style={{ marginTop: 4, fontSize: 12 }}>3 soniyadan so\u02BBng kirish sahifasiga yo\u02BBnaltirilasiz...</p>
            <Link to="/admin/login" className="text-link" style={{ justifyContent: 'center', marginTop: 12 }}>
              Hozir kirish <ArrowLeft size={14} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <form className="auth-form" noValidate onSubmit={handleSubmit}>
            {error && (
              <div className="auth-general-error" role="alert">
                {error}
              </div>
            )}

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="new-password">
                Yangi parol (kamida 8 belgi)
              </label>
              <PasswordInput
                id="new-password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                placeholder="Yangi parol"
                autoComplete="new-password"
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="confirm-password">
                Yangi parolni tasdiqlang
              </label>
              <PasswordInput
                id="confirm-password"
                name="confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                placeholder="Parolni qayta kiriting"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-submit-btn"
            >
              <KeyRound size={16} aria-hidden="true" />
              {isSubmitting ? 'Saqlanmoqda...' : 'Yangi parolni saqlash'}
            </button>
          </form>
        )}

        <Link to="/admin/login" className="text-link" style={{ justifyContent: 'center' }}>
          <ArrowLeft size={14} aria-hidden="true" /> Kirish sahifasiga qaytish
        </Link>
      </motion.div>
    </div>
  );
}

