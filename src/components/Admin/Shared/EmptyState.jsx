import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  title = 'Ma\u02BBlumot topilmadi',
  description = 'Hozircha hech qanday yozuv kiritilmagan.',
  actionLabel,
  onAction,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '14px', textAlign: 'center' }}>
      <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--accent-wash)', border: '1px solid var(--border-gold)', display: 'grid', placeItems: 'center', color: 'var(--gold-primary)' }}>
        <FolderOpen size={24} aria-hidden="true" />
      </div>
      <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="gold-button"
          style={{ minHeight: '40px', padding: '9px 18px', fontSize: '11px', marginTop: '8px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

