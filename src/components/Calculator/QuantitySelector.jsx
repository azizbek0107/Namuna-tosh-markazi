import { Minus, Plus } from 'lucide-react';
import { unitLabel } from '../../utils/priceUtils';
import './QuantitySelector.css';

export default function QuantitySelector({ quantity, onChange, mode, unit, error }) {
  const pieces = mode === 'pieces';
  const numeric = Number(quantity);
  function step(direction) {
    const base = Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
    const next = Math.max(0, pieces ? Math.floor(base) + direction : Math.round((base + direction) * 100) / 100);
    onChange(String(next));
  }
  return <div className="calculator-quantity"><label htmlFor="order-quantity">Miqdor, {pieces ? 'dona' : unitLabel(unit)}</label><div className="quantity-stepper"><button type="button" aria-label="Miqdorni kamaytirish" disabled={!Number.isFinite(numeric) || numeric <= 0} onClick={() => step(-1)}><Minus size={17} aria-hidden="true" /></button><input id="order-quantity" aria-label="Buyurtma miqdori" type="number" min="0" step={pieces ? '1' : '0.01'} inputMode={pieces ? 'numeric' : 'decimal'} value={quantity} onChange={event => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'calculator-quantity-error' : 'calculator-quantity-help'} /><button type="button" aria-label="Miqdorni oshirish" disabled={numeric >= Number.MAX_SAFE_INTEGER} onClick={() => step(1)}><Plus size={17} aria-hidden="true" /></button></div><p id="calculator-quantity-help">{pieces ? 'Dona soni butun son bilan kiritiladi.' : 'Sotuv birligidagi miqdorni kiriting. Kasr qiymatlar ham mumkin.'}</p>{error && <p id="calculator-quantity-error" className="calculator-error" role="alert">{error}</p>}</div>;
}
