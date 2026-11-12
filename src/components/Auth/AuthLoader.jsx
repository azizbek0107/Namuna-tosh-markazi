import './AuthLoader.css';

export default function AuthLoader({ message = 'Tekshirilmoqda...' }) {
  return (
    <div className="auth-loader-container" role="status" aria-live="polite">
      <div className="auth-spinner" aria-hidden="true" />
      <p className="auth-loader-text">{message}</p>
    </div>
  );
}
