import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Ruler } from 'lucide-react';
import useLanguage from '../../hooks/useLanguage';
import './ProductSizeFilter.css';

export default function ProductSizeFilter({ value, onChange, sizeOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { t } = useLanguage();

  // Compile all options
  const allOptions = [
    { value: 'all', label: t('catalog.size_all', 'Barcha o‘lchamlar') },
    ...sizeOptions,
    { value: 'unknown', label: t('catalog.size_unknown', 'O‘lchami aniqlashtiriladi') }
  ];

  const currentOption = allOptions.find((opt) => opt.value === value) || allOptions[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="product-size-filter-wrapper" ref={containerRef}>
      {/* Hidden standard select for screen readers and tests */}
      <label className="sr-only" htmlFor="product-size-filter">
        O‘lchamni filtrlash
      </label>
      <select
        id="product-size-filter"
        aria-label="O‘lchamni filtrlash"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="product-size-native-select"
        tabIndex={-1}
      >
        <option value="all">Barcha o‘lchamlar</option>
        {sizeOptions.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
        <option value="unknown">O‘lchami aniqlashtiriladi</option>
      </select>

      {/* Styled Trigger Button */}
      <button
        type="button"
        className={`product-size-trigger-btn ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="size-trigger-prefix">
          <Ruler size={13} className="size-ruler-icon" aria-hidden="true" />
          <span className="size-trigger-label">O‘lcham bo‘yicha:</span>
        </span>
        <span className="size-trigger-current">{currentOption.label}</span>
        <ChevronDown size={14} className={`size-chevron ${isOpen ? 'is-rotated' : ''}`} aria-hidden="true" />
      </button>

      {/* Styled Dropdown Window (Ochilib turuvchi oyna) */}
      {isOpen && (
        <div className="product-size-window" role="listbox" aria-label="O‘lcham bo‘yicha filtr">
          <div className="product-size-window-head">
            <span>O‘LCHAMLAR BO‘YICHA</span>
            <span className="size-count-badge">{allOptions.length} ta variant</span>
          </div>
          <div className="product-size-window-list">
            {allOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  className={`product-size-window-item ${isSelected ? 'is-selected' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span className="size-item-text">{opt.label}</span>
                  {isSelected && <Check size={14} className="size-item-check" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

