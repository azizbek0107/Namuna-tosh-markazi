import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import PasswordInput from './PasswordInput.jsx';
import './LoginForm.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ onSubmit, error, isSubmitting = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errors.email = 'Email manzilini kiriting.';
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      errors.email = 'Email formati noto\u02BBg\u02BBri.';
    }

    if (!password) {
      errors.password = 'Parolni kiriting.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    if (validate()) {
      onSubmit({ email: email.trim(), password });
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
  }

  return (
    <form className="auth-form" noValidate onSubmit={handleSubmit}>
      {error && (
        <div className="auth-general-error" role="alert">
          {error}
        </div>
      )}

      {/* Email input */}
      <div className="auth-form-group">
        <label className="auth-label" htmlFor="admin-email">
          Email manzil
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isSubmitting}
          value={email}
          onChange={handleEmailChange}
          placeholder="admin@example.com"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
          className="auth-input"
        />
        {fieldErrors.email && (
          <p id="admin-email-error" className="auth-field-error" role="alert">
            ⚠ {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password input */}
      <div className="auth-form-group">
        <div className="auth-label">
          <label htmlFor="admin-password">Parol</label>
          <Link to="/admin/forgot-password" className="auth-link">
            Parolni unutdingizmi?
          </Link>
        </div>
        <PasswordInput
          id="admin-password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          required
          disabled={isSubmitting}
          autoComplete="current-password"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
        />
        {fieldErrors.password && (
          <p id="admin-password-error" className="auth-field-error" role="alert">
            ⚠ {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-submit-btn"
      >
        <LogIn size={16} aria-hidden="true" />
        {isSubmitting ? 'Kirilmoqda...' : 'Tizimga kirish'}
      </button>
    </form>
  );
}

