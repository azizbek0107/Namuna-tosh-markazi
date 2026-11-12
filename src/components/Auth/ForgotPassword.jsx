import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import useAuth from '../../hooks/useAuth.js';
import './ForgotPassword.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reduced = useReducedMotion();

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Email manzilini kiriting.');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Email formati noto\u02BBg\u02BBri.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(cleanEmail);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: reduced ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.3 }}
      >
        <div className="auth-card-header">
          <span className="page-eyebrow" style={{ justifyContent: 'center' }}>
            <span /> XAVFSIZLIK
          </span>
          <h2>Parolni tiklash</h2>
          <p>Administrator hisobingizga biriktirilgan email manzilni kiriting.</p>
        </div>

        {submitted ? (
          <div className="auth-success-banner" role="status">
            Agar ushbu email ro\u02BByxatdan o\u02BBtgan bo\u02BBlsa, parolni tiklash bo\u02BByicha ko\u02BBrsatma yuboriladi.
            Iltimos, pochtangizni (jumladan Spam papkasini) tekshiring.
          </div>
        ) : (
          <form className="auth-form" noValidate onSubmit={handleSubmit}>
            {error && (
              <div className="auth-general-error" role="alert">
                {error}
              </div>
            )}

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="forgot-email">
                Email manzil
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="admin@example.com"
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-submit-btn"
            >
              <Mail size={16} aria-hidden="true" />
              {isSubmitting ? 'Yuborilmoqda...' : 'Tiklash xabarini yuborish'}
            </button>
          </form>
        )}

        <Link to="/admin/login" className="text-link" style={{ justifyContent: 'center', marginTop: 8 }}>
          <ArrowLeft size={14} aria-hidden="true" /> Kirish sahifasiga qaytish
        </Link>
      </motion.div>
    </div>
  );
}
