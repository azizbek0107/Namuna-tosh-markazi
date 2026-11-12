import { formatSize, sizeKey } from '../../utils/catalogUtils';
import './SizeSelector.css';

export default function SizeSelector({ sizes = [], value, onChange }) {
  const safeSizes = Array.isArray(sizes) ? sizes : [];
  return (
    <fieldset className="calculator-sizes">
      <legend>O‘lcham tanlash</legend>
      {safeSizes.length ? (
        <div className="calculator-size-options">
          {safeSizes.map(size => (
            <label key={sizeKey(size)} className={value === sizeKey(size) ? 'is-selected' : ''}>
              <input
                type="radio"
                name="order-size"
                value={sizeKey(size)}
                checked={value === sizeKey(size)}
                onChange={() => onChange(sizeKey(size))}
              />
              <span>{formatSize(size)}</span>
            </label>
          ))}
        </div>
      ) : (
        <p>
          O‘lchamni aniqlashtirish <span>— tasdiqlangan o‘lchamlar hali kiritilmagan.</span>
        </p>
      )}
    </fieldset>
  );
}
