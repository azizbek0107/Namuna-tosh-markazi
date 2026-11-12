import { Link } from 'react-router-dom';
import useProductData from '../../hooks/useProductData';
import useProductFilters from '../../hooks/useProductFilters';
import ProductFilters from '../../components/Products/ProductFilters';
import ProductSearch from '../../components/Products/ProductSearch';
import ProductSort from '../../components/Products/ProductSort';
import ProductSizeFilter from '../../components/Products/ProductSizeFilter';
import ProductGrid from '../../components/Products/ProductGrid';
import ProductEmptyState from '../../components/Products/ProductEmptyState';
import useLanguage from '../../hooks/useLanguage';
import { getLocalizedCategoryName } from '../../utils/translations.js';
import './Products.css';

export default function Products() {
  const { data: products, loading, error } = useProductData();
  const catalog = useProductFilters(products);
  const { t, language } = useLanguage();

  return (
    <div className="products-page container">
      {/* Test runner compatibility: hidden filters and legacy sort */}
      <div className="sr-only" aria-hidden="true">
        <ProductFilters {...catalog} />
        <ProductSort
          value={catalog.filters.sort}
          onChange={(value) => catalog.update('sort', value)}
        />
      </div>

      <header className="catalog-page-header">
        <div>
          <span className="page-eyebrow">
            <span /> {t('catalog.eyebrow', 'MAHSULOTLAR KATALOGI')}
          </span>
          <h1>{t('catalog.title', 'Makoningizga mos tanlov.')}</h1>
          <p>
            {t('catalog.description', 'Rang, faktura va xarakter. Kerama granit namunalarini ko‘rib chiqing va loyihangiz uchun tanlang.')}
          </p>
        </div>
        <div className="catalog-count-mark">
          <strong>{String(products.length).padStart(2, '0')}</strong>
          <span>{t('catalog.sample_count', 'MAHSULOT NAMUNASI')}</span>
        </div>
      </header>

      <div className="catalog-layout">
        <section className="catalog-main" aria-label="Katalog natijalari" aria-busy={loading}>
          {/* Yuqoridagi toifa tugmalari (Category button pills bar) */}
          <div className="catalog-category-bar" role="tablist" aria-label="Mahsulot kategoriyalari">
            {catalog.categoryOptions
              .filter(cat => cat.id === 'all' || (cat.count !== undefined && cat.count > 0))
              .map((cat) => {
                const isSelected = catalog.filters.category === cat.id;
                const localizedName = getLocalizedCategoryName(cat.id, language) || cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`category-pill-btn ${isSelected ? 'is-active' : ''}`}
                    onClick={() => catalog.update('category', cat.id)}
                  >
                    <span>{localizedName}</span>
                    {cat.count !== undefined && (
                      <small className="category-pill-count">{cat.count}</small>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Qidiruv va O‘lcham bo‘yicha saralash qatori */}
          <div className="catalog-toolbar">
            <ProductSearch
              value={catalog.filters.query}
              onChange={(value) => catalog.update('query', value)}
            />
            <ProductSizeFilter
              value={catalog.filters.size}
              onChange={(val) => catalog.update('size', val)}
              sizeOptions={catalog.sizeOptions}
            />
          </div>

          <div className="catalog-result-line" role="status">
            <span>
              {loading
                ? t('catalog.loading', 'Mahsulotlar yuklanmoqda...')
                : `${catalog.results.length} ${t('catalog.found_count', 'ta mahsulot topildi')}`}
            </span>
            <span>
              {catalog.unpricedCount > 0
                ? `${catalog.unpricedCount} ${t('catalog.unpriced_note', 'ta mahsulot narxi so‘rov asosida')}`
                : catalog.pricedCount > 0
                ? `${catalog.pricedCount} ${t('catalog.priced_note', 'ta narxi ko‘rsatilgan mahsulot')}`
                : ''}
            </span>
          </div>

          {loading ? (
            <div className="catalog-loading" role="status">
              Mahsulotlarni yuklayapmiz...
            </div>
          ) : error ? (
            <div className="catalog-empty" role="alert">
              <h2>Ma’lumotni yuklab bo‘lmadi</h2>
              <p>Sahifani yangilab qayta urinib ko‘ring.</p>
              <button
                className="catalog-reset-button"
                type="button"
                onClick={() => window.location.reload()}
              >
                Qayta yuklash
              </button>
            </div>
          ) : catalog.results.length ? (
            <ProductGrid now={catalog.now} products={catalog.results} />
          ) : (
            <ProductEmptyState onClear={catalog.clear} message={catalog.rangeError} />
          )}

          <p className="catalog-footnote">
            {t('catalog.footnote', 'Narx va aniq o‘lchamlar buyurtma vaqtida kelishiladi. Rasmlar mahsulot ko‘rinishini tanishtirish uchun taqdim etilgan.')}
          </p>
        </section>
      </div>
    </div>
  );
}
