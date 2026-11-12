import { useState, useId, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext.jsx';
import { categoryName } from '../../data/categories.js';
import { formatMoney, unitLabel } from '../../utils/priceUtils.js';
import { calculateOrder, formatMeasure, sizeSupportsPieces, plateArea } from '../../utils/calculatorUtils.js';
import './QuantityModal.css';

export default function QuantityModal({ product, isOpen, onClose }) {
  const modalId = useId();
  const { addItem, openCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(() => product?.sizes?.[0] || null);
  const [mode, setMode] = useState(() => (product?.priceUnit === 'piece' ? 'pieces' : 'direct'));
  const [quantity, setQuantity] = useState('1');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const inputRef = useRef(null);

  // Sync when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || null);
      setMode(product.priceUnit === 'piece' ? 'pieces' : 'direct');
      setQuantity('1');
      setAddedSuccess(false);
    }
  }, [product, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isPieces = mode === 'pieces';
  const numericQty = parseFloat(quantity) || 0;

  // Calculate live order
  const calculation = calculateOrder(product, {
    size: selectedSize,
    quantity: numericQty > 0 ? numericQty : 1,
    mode,
  });

  const stepQuantity = (delta) => {
    const current = parseFloat(quantity) || 0;
    const next = Math.max(1, isPieces ? Math.floor(current) + delta : Math.round((current + delta) * 10) / 10);
    setQuantity(String(next));
  };

  const handleQuickAdd = (addVal) => {
    const current = parseFloat(quantity) || 0;
    setQuantity(String(current + addVal));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (numericQty <= 0) return;

    addItem(product, {
      size: selectedSize,
      quantity: numericQty,
      mode,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
      openCart(); // Automatically open Yandex-style cart drawer
    }, 450);
  };

  const firstImage = product.images?.[0];
  const thumbSrc = typeof firstImage === 'string'
    ? firstImage
    : (firstImage?.src || firstImage?.url || '/images/products/placeholder.jpg');

  const unitText = isPieces ? 'dona' : unitLabel(product.priceUnit);

  // Area preview if m2 and pieces
  const pieceArea = product.priceUnit === 'm2' && selectedSize ? plateArea(selectedSize) : null;
  const totalM2Equivalent = pieceArea && isPieces ? (pieceArea * numericQty).toFixed(2) : null;

  return createPortal(
    <div className="qm-overlay" onClick={onClose} role="presentation">
      <motion.div
        className="qm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${modalId}-title`}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="qm-header">
          <div className="qm-header-info">
            <span className="qm-category">{categoryName(product.category)}</span>
            <h2 id={`${modalId}-title`} className="qm-title">{product.name}</h2>
          </div>
          <button
            type="button"
            className="qm-close-btn"
            onClick={onClose}
            aria-label="Yopish"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Product mini card */}
        <div className="qm-product-row">
          <img src={thumbSrc} alt={product.name} className="qm-thumb" />
          <div className="qm-product-meta">
            <div className="qm-unit-price">
              {product.price
                ? <><strong>{formatMoney(product.price)}</strong> / {unitLabel(product.priceUnit)}</>
                : <span className="qm-inquiry">Narxi so‘rov asosida</span>}
            </div>
            <p className="qm-stock-status">✓ Ishlab chiqaruvchidan to‘g‘ridan-to‘g‘ri</p>
          </div>
        </div>

        <form onSubmit={handleAddToCart} className="qm-form">
          {/* Size Selector */}
          {product.sizes?.length > 1 && (
            <div className="qm-field-group">
              <label className="qm-field-label">O‘lchamni tanlang:</label>
              <div className="qm-sizes-pills" role="radiogroup" aria-label="Mahsulot o‘lchamlari">
                {product.sizes.map((s, idx) => {
                  const isSelected = selectedSize === s || (selectedSize?.widthCm === s.widthCm && selectedSize?.lengthCm === s.lengthCm);
                  return (
                    <button
                      type="button"
                      key={idx}
                      className={`qm-size-pill${isSelected ? ' is-selected' : ''}`}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s.lengthCm} × {s.widthCm} sm
                      {s.thicknessMm ? ` · ${s.thicknessMm} mm` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode switch (if applicable) */}
          {product.priceUnit !== 'piece' && (
            <div className="qm-mode-switch">
              <button
                type="button"
                className={`qm-mode-btn${isPieces ? ' is-active' : ''}`}
                onClick={() => setMode('pieces')}
              >
                Dona hisobida
              </button>
              <button
                type="button"
                className={`qm-mode-btn${!isPieces ? ' is-active' : ''}`}
                onClick={() => setMode('direct')}
              >
                {unitLabel(product.priceUnit)} hisobida
              </button>
            </div>
          )}

          {/* Direct Quantity Stepper (No scroll / range slider) */}
          <div className="qm-field-group">
            <label htmlFor={`${modalId}-qty`} className="qm-field-label">
              Kerakli miqdor ({unitText}):
            </label>
            <div className="qm-stepper">
              <button
                type="button"
                className="qm-step-btn"
                onClick={() => stepQuantity(-1)}
                disabled={numericQty <= 1}
                aria-label="Kamaytirish"
              >
                <Minus size={18} />
              </button>
              <input
                ref={inputRef}
                id={`${modalId}-qty`}
                type="number"
                min="1"
                step={isPieces ? '1' : '0.1'}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="qm-qty-input"
                aria-label="Mahsulot miqdori"
                required
              />
              <button
                type="button"
                className="qm-step-btn"
                onClick={() => stepQuantity(1)}
                aria-label="Oshirish"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="qm-presets">
              <button type="button" onClick={() => handleQuickAdd(5)} className="qm-preset-btn">+5</button>
              <button type="button" onClick={() => handleQuickAdd(10)} className="qm-preset-btn">+10</button>
              <button type="button" onClick={() => handleQuickAdd(20)} className="qm-preset-btn">+20</button>
              <button type="button" onClick={() => handleQuickAdd(50)} className="qm-preset-btn">+50</button>
            </div>

            {totalM2Equivalent && (
              <p className="qm-equivalent">
                ≈ <strong>{totalM2Equivalent} m²</strong> hajmiga teng bo‘ladi.
              </p>
            )}
          </div>

          {/* Real-time Calculation Summary */}
          {calculation.subtotal !== null && (
            <div className="qm-calc-summary">
              <div className="qm-calc-row">
                <span>Jami hisoblangan qiymat:</span>
                <strong className="qm-calc-total">{formatMoney(calculation.total || calculation.subtotal)}</strong>
              </div>
              {calculation.hasDiscount && (
                <div className="qm-discount-line">
                  Aksiya chegirmasi: -{formatMoney(calculation.discountAmount)}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="qm-actions">
            <button
              type="button"
              className="qm-cancel-btn"
              onClick={onClose}
              aria-label="Oynani yopish"
            >
              <X size={15} aria-hidden="true" />
              <span>Yopish</span>
            </button>
            <button
              type="submit"
              className={`qm-submit-btn${addedSuccess ? ' is-success' : ''}`}
              disabled={numericQty <= 0}
            >
              {addedSuccess ? (
                <>
                  <Check size={18} aria-hidden="true" />
                  <span>Savatchaga qo‘shildi!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} aria-hidden="true" />
                  <span>Savatchaga qo‘shish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}

