import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorState({ error, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', gap: '16px', textAlign: 'center' }} role="alert">
      <AlertCircle size={36} style={{ color: '#e05555' }} aria-hidden="true" />
      <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Xatolik yuz berdi</h3>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px' }}>
        {error || 'Ma\u02BBlumotlarni yuklab bo\u02BBlmadi.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="gold-button"
          style={{ minHeight: '38px', padding: '8px 16px', fontSize: '11px', marginTop: '8px' }}
        >
          <RotateCcw size={14} aria-hidden="true" /> Qaytadan urinish
        </button>
      )}
    </div>
  );
}

