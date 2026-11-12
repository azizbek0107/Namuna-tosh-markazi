export default function LoadingState({ message = 'Ma\u02BBlumotlar yuklanmoqda...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }} role="status">
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--border-gold)', borderTopColor: 'var(--gold-primary)', animation: 'authSpin 0.8s linear infinite' }} aria-hidden="true" />
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>{message}</p>
    </div>
  );
}

