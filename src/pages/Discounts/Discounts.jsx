import useDiscounts from '../../hooks/useDiscounts';
import { useLanguage } from '../../hooks/useLanguage';
import DiscountHero from '../../components/Discounts/DiscountHero';
import DiscountFilters from '../../components/Discounts/DiscountFilters';
import DiscountGrid from '../../components/Discounts/DiscountGrid';
import DiscountEmptyState from '../../components/Discounts/DiscountEmptyState';
import './Discounts.css';

export default function Discounts() {
  const offers = useDiscounts();
  const { t } = useLanguage();

  return (
    <div className="discounts-page container">
      <DiscountHero activeCount={offers.activeCount} />
      <div className="discounts-layout">
        <DiscountFilters {...offers} />
        <section className="discounts-results" aria-label={t('discounts.results_label', 'Faol chegirmalar')} aria-busy={offers.loading}>
          <p className="discounts-result-count" role="status">
            {offers.loading
              ? t('discounts.loading', 'Takliflar yuklanmoqda...')
              : `${offers.results.length} ${t('discounts.active_count', 'ta faol taklif topildi')}`}
          </p>
          {offers.announcement && <p className="discount-expiry-notice" role="status">{offers.announcement}</p>}
          {offers.loading ? (
            <div className="discount-empty" role="status">{t('discounts.loading', 'Takliflarni yuklayapmiz...')}</div>
          ) : offers.error ? (
            <div className="discount-empty" role="alert">
              <h2>{t('discounts.error_title', 'Takliflarni yuklab bo‘lmadi')}</h2>
              <p>{t('discounts.error_desc', 'Sahifani yangilab qayta urinib ko‘ring.')}</p>
              <button type="button" className="discount-clear-button" onClick={() => window.location.reload()}>{t('discounts.retry', 'Qayta yuklash')}</button>
            </div>
          ) : offers.results.length ? (
            <DiscountGrid products={offers.results} now={offers.now} />
          ) : (
            <DiscountEmptyState filtered={offers.activeCount > 0} onClear={offers.clear} />
          )}
          <p className="discounts-footnote">
            {t('discounts.footnote', 'Narxlar bir sotuv birligi uchun ko‘rsatilgan. Chegirma buyurtmaning umumiy summasiga qo‘llanadi. Aksiya vaqti qurilmangiz soati bo‘yicha, sanalar Toshkent vaqti bilan hisoblanadi.')}
          </p>
        </section>
      </div>
    </div>
  );
}
