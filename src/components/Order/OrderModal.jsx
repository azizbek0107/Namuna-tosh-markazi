import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ORDER_STEPS } from '../../utils/orderUtils.js';
import { categoryName } from '../../data/categories.js';
import OrderFormStep from './OrderFormStep.jsx';
import OrderConfirmation from './OrderConfirmation.jsx';
import OrderSuccess from './OrderSuccess.jsx';
import './OrderModal.css';

const STEP_LABELS = {
  [ORDER_STEPS.EDITING]: "Ma\u02BBlumotlar",
  [ORDER_STEPS.REVIEW]: "Tekshirish",
  [ORDER_STEPS.READY]: "Yuborish",
  [ORDER_STEPS.COPIED]: "Yuborish",
  [ORDER_STEPS.TELEGRAM_OPENED]: "Yuborish",
};

const STEP_ORDER = [ORDER_STEPS.EDITING, ORDER_STEPS.REVIEW, ORDER_STEPS.READY];

/**
 * OrderModal — accessible dialog for the full Telegram ordering workflow.
 *
 * Props:
 *   product   — product object
 *   order     — useOrder() return value
 *   onClose   — callback to close the modal
 */
export default function OrderModal({ product, order, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const reduced = useReducedMotion();

  // Focus close button on mount & listen to Escape key globally
  useEffect(() => {
    closeRef.current?.focus();
    const handleGlobalKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [onClose]);

  // Focus trap inside dialog
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(
      dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.closest('[inert]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Backdrop click closes modal
  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget) onClose();
  }, [onClose]);

  const stepIndex = STEP_ORDER.indexOf(order.step);
  const effectiveStepIndex = Math.max(stepIndex, 0);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const dialogVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.98 },
  };

  const firstImage = product.images?.[0];
  const thumbSrc = typeof firstImage === 'string'
    ? firstImage
    : (firstImage?.src || firstImage?.url || firstImage?.image_url || null);
  const catDisplay = categoryName(product.category || product.categories?.[0]) || 'Kerama granit';

  const modalContent = (
    <motion.div
      className="om-backdrop"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: reduced ? 0 : 0.22 }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="om-dialog-title"
        className="om-dialog"
        variants={dialogVariants}
        transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="om-header">
          <div className="om-header-meta">
            <span className="om-eyebrow">BUYURTMA / ORDER</span>
            <h2 id="om-dialog-title" className="om-title">Buyurtma berish</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="om-close"
            aria-label="Oynani yopish"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="om-body">
          {/* Step progress */}
          <nav className="om-steps" aria-label="Buyurtma bosqichlari">
            {STEP_ORDER.map((s, i) => {
              const isDone = i < effectiveStepIndex;
              const isActive = i === effectiveStepIndex;
              return (
                <div key={s} style={{ display: 'contents' }}>
                  <div
                    className={`om-step-item${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span className="om-step-dot">{isDone ? '✓' : i + 1}</span>
                    <span>{STEP_LABELS[s]}</span>
                  </div>
                  {i < STEP_ORDER.length - 1 && <span className="om-step-sep" aria-hidden="true" />}
                </div>
              );
            })}
          </nav>

          {/* Product bar */}
          <div className="om-product-bar" aria-label="Tanlangan mahsulot">
            {thumbSrc ? (
              <img
                className="om-product-thumb"
                src={thumbSrc}
                alt={firstImage?.alt ?? product.name}
                width={60}
                height={60}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="om-product-thumb-placeholder" aria-hidden="true">◆</div>
            )}
            <div>
              <p className="om-product-name">{product.name}</p>
              <p className="om-product-category">{catDisplay}</p>
            </div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait" initial={false}>
            {order.step === ORDER_STEPS.EDITING && (
              <OrderFormStep key="editing" product={product} order={order} />
            )}
            {order.step === ORDER_STEPS.REVIEW && (
              <OrderConfirmation key="review" product={product} order={order} />
            )}
            {(order.step === ORDER_STEPS.READY ||
              order.step === ORDER_STEPS.COPIED ||
              order.step === ORDER_STEPS.TELEGRAM_OPENED) && (
              <OrderSuccess key="success" product={product} order={order} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
