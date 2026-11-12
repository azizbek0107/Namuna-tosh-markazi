import useLanguage from '../../hooks/useLanguage';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowUpRight, ShoppingBag, Check, X } from 'lucide-react';
import { TELEGRAM_URL } from '../../config/contactConfig.js';
import { useCart } from '../../context/CartContext.jsx';
import { unitLabel } from '../../utils/priceUtils.js';
import './OrderButton.css';

/**
 * OrderButton — versatile button for ordering.
 * - When `product` is provided: clicking transforms the button into an inline quantity input
 *   without opening a modal. Scroll wheel is strictly disabled so quantity is only typed via keyboard.
 * - Submitting adds the chosen quantity to the Yandex-style cart drawer.
 * - When `product` is omitted: renders as a direct Telegram link button (backward-compatible).
 */
export default function OrderButton({
  product,
  className = '',
  variant = '',
  label,
  onClick,
  children,
}) {
  const { t, language } = useLanguage();
  const [isEnteringQuantity, setIsEnteringQuantity] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [added, setAdded] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const cartContext = useCart();
  const addItem = cartContext?.addItem;
  const openCart = cartContext?.openCart;
  const items = cartContext?.items || [];
  const existingCartItem = product ? items.find(i => i.product?.id === product.id) : null;
  const isInCart = Boolean(existingCartItem);

  const variantClass = variant ? ` order-btn--${variant}` : '';
  const content = children ?? label ?? t('product.order_btn');

  // Strictly block mouse wheel scrolling from changing the number value
  useEffect(() => {
    if (!isEnteringQuantity) return;
    const input = inputRef.current;
    if (!input) return;

    const preventWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    input.addEventListener('wheel', preventWheel, { passive: false });
    return () => {
      input.removeEventListener('wheel', preventWheel);
    };
  }, [isEnteringQuantity]);

  // Auto focus input when inline mode opens
  useEffect(() => {
    if (isEnteringQuantity) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEnteringQuantity]);

  // Click outside and Escape key to close inline input
  useEffect(() => {
    if (!isEnteringQuantity) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsEnteringQuantity(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsEnteringQuantity(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnteringQuantity]);

  const handleOpenInput = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);
    setQuantity(existingCartItem ? String(existingCartItem.quantity) : '1');
    setIsEnteringQuantity(true);
  };

  const handleClose = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsEnteringQuantity(false);
  };

  const handleConfirm = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const numericQty = parseFloat(quantity);
    if (!numericQty || numericQty <= 0) return;

    if (addItem) {
      addItem(product, {
        size: product.sizes?.[0] || null,
        quantity: numericQty,
        mode: product.priceUnit === 'piece' ? 'pieces' : 'direct',
      });
    }

    setAdded(true);
    if (openCart) {
      openCart();
    }

    setTimeout(() => {
      setAdded(false);
      setIsEnteringQuantity(false);
    }, 700);
  };

  // If no product is attached, behave as a direct Telegram link
  if (!product) {
    return (
      <a
        className={`gold-button ${className}`.trim()}
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {content} <ArrowUpRight size={17} aria-hidden="true" />
        <span className="sr-only"> (Telegram, yangi oynada ochiladi)</span>
      </a>
    );
  }

  const unitText = product.priceUnit === 'piece' ? t('cart.unit_piece') : (unitLabel(product.priceUnit, language) || t('cart.unit_piece'));

  // When active: render inline quantity input in place of the button without opening any modal
  if (isEnteringQuantity) {
    return (
      <form
        ref={containerRef}
        className={`order-qty-inline${variantClass}${className ? ` ${className}` : ''}`}
        onSubmit={handleConfirm}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="order-qty-input-group">
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            min="0.01"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onWheel={(e) => {
              e.preventDefault();
              e.currentTarget.blur();
            }}
            placeholder={t('order.quantity')}
            className="order-qty-input"
            aria-label={`${product.name} — ${t('order.quantity')}`}
            disabled={added}
          />
          <span className="order-qty-unit">{unitText}</span>
        </div>

        <button
          type="submit"
          className="order-qty-confirm-btn"
          disabled={added || !quantity || parseFloat(quantity) <= 0}
          aria-label={t('order.add')}
        >
          {added ? (
            <>
              <Check size={14} className="order-qty-check-icon" aria-hidden="true" />
              <span>{t('order.added')}</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} aria-hidden="true" />
              <span>{t('order.to_cart')}</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="order-qty-cancel-btn"
          onClick={handleClose}
          aria-label={t('order.cancel')}
          title={t('order.cancel')}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      className={`order-btn${isInCart ? ' order-btn--in-cart' : ''}${variantClass}${className ? ` ${className}` : ''}`}
      onClick={handleOpenInput}
      aria-label={`${product.name} — ${isInCart ? t('order.quantity') : t('product.order_btn')}`}
    >
      {isInCart ? (
        <>
          <Check size={15} aria-hidden="true" />
          <span>{t('product.in_cart_prefix')} ({existingCartItem.quantity} {unitText})</span>
        </>
      ) : (
        <>
          <ShoppingBag size={15} aria-hidden="true" />
          {content}
        </>
      )}
    </button>
  );
}
