import { Search, X } from 'lucide-react';
import useLanguage from '../../hooks/useLanguage';
import './ProductSearch.css';

export default function ProductSearch({ value, onChange }) {
  const { t } = useLanguage();

  return (
    <div className="product-search">
      <Search size={17} strokeWidth={1.5} aria-hidden="true" />
      <label className="sr-only" htmlFor="product-search">
        {t('catalog.search_label', 'Mahsulot qidirish')}
      </label>
      <input
        id="product-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('catalog.search_placeholder', 'Nomi yoki artikul bo‘yicha qidiring...')}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('catalog.clear_search', 'Qidiruvni tozalash')}
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
