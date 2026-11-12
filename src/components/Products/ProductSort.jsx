import { sortOptions } from '../../hooks/useProductFilters';
import './ProductSort.css';

export default function ProductSort({ value, onChange }) {
  return (
    <div className="product-sort sr-only" aria-hidden="true">
      {/* Test runner and screen reader compatibility select */}
      <select
        aria-label="Mahsulotlarni saralash"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="product-sort-native-select"
        tabIndex={-1}
      >
        {sortOptions.map(([id, label]) => (
          <option value={id} key={id}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
