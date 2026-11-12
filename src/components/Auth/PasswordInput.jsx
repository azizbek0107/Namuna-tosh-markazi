import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './PasswordInput.css';

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = '••••••••',
  required = true,
  disabled = false,
  autoComplete = 'current-password',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-password-wrapper">
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        className="auth-password-input"
      />
      <button
        type="button"
        className="auth-password-toggle"
        onClick={() => setShowPassword(prev => !prev)}
        aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\u02BBrish'}
        tabIndex={0}
      >
        {showPassword ? (
          <EyeOff size={18} aria-hidden="true" />
        ) : (
          <Eye size={18} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

