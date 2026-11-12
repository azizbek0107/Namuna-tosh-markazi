import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import './ConfirmDialog.css';

export default function ConfirmDialog({
  isOpen,
  title = 'Tasdiqlash',
  message = 'Ushbu amalni bajarishga ishonchingiz komilmi?',
  confirmLabel = 'O\u02BBchirish',
  cancelLabel = 'Bekor qilish',
  onConfirm,
  onCancel,
  isDanger = true,
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onCancel?.();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <motion.div
        className="confirm-modal"
        initial={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="confirm-header">
          <div className="confirm-icon">
            <AlertTriangle size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 id="confirm-dialog-title">{title}</h3>
            <p>{message}</p>
          </div>
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={isDanger ? 'confirm-btn-danger' : 'gold-button'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

