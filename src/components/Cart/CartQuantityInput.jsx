import { useEffect, useRef, useState } from 'react';
import { calculateOrder } from '../../utils/calculatorUtils.js';
import useLanguage from '../../hooks/useLanguage';

export default function CartQuantityInput({ item, name, onChange }) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(String(item.quantity));
  const inputRef = useRef(null);
  const pieces = item.mode === 'pieces' || item.product.priceUnit === 'piece';

  useEffect(() => setDraft(String(item.quantity)), [item.quantity]);

  useEffect(() => {
    const input = inputRef.current;
    function wheel(event) {
      if (document.activeElement !== input || event.ctrlKey || event.deltaY === 0) return;
      event.preventDefault();
      const typed = Number(input.value);
      const current = Number.isFinite(typed) && typed > 0 ? typed : item.quantity;
      const next = event.deltaY < 0
        ? Math.floor(current) + 1
        : Math.max(1, Math.ceil(current) - 1);
      if (calculateOrder(item.product, { size: item.size, mode: item.mode, quantity: next }).valid) {
        setDraft(String(next));
        onChange(item.id, next);
      }
    }
    // A non-passive listener also prevents the native fractional wheel step.
    input.addEventListener('wheel', wheel, { passive: false });
    return () => input.removeEventListener('wheel', wheel);
  }, [item, onChange]);

  const valid = calculateOrder(item.product, {
    size: item.size,
    mode: item.mode,
    quantity: draft,
  }).valid;

  return (
    <input
      ref={inputRef}
      className="yandex-qty-input"
      type="number"
      inputMode={pieces ? 'numeric' : 'decimal'}
      min={pieces ? 1 : .01}
      max={Number.MAX_SAFE_INTEGER}
      step={pieces ? 1 : .01}
      value={draft}
      aria-label={`${name} — ${t('order.quantity')}`}
      aria-invalid={!valid}
      onChange={event => {
        const value = event.target.value;
        setDraft(value);
        const calculation = calculateOrder(item.product, {
          size: item.size,
          mode: item.mode,
          quantity: value,
        });
        if (calculation.valid) onChange(item.id, Number(value));
      }}
      onBlur={() => setDraft(String(item.quantity))}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}
