import { Link } from 'react-router-dom';
import { BadgePercent, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export default function DiscountEmptyState({ filtered = false, onClear }) {
  const { t } = useLanguage();

  return (
    <section className="discount-empty" aria-labelledby="discount-empty-title">
      <BadgePercent size={42} strokeWidth={1} aria-hidden="true" />
      <h2 id="discount-empty-title">
        {filtered
          ? t('discounts.empty_filtered_title', 'Tanlangan filtrlarga mos aksiya topilmadi')
          : t('discounts.empty_general_title', 'Hozircha faol chegirmalar mavjud emas')}
      </h2>
      <p>
        {filtered
          ? t(
              'discounts.empty_filtered_desc',
              'Boshqa kategoriya yoki chegirma turini tanlang. Barcha aksiyalarni ko‘rish uchun filtrlarni tozalang.'
            )
          : t(
              'discounts.empty_general_desc',
              'Yangi aksiyalarimizni kuzatib boring. Mahsulotlar katalogimiz bilan tanishishingiz mumkin.'
            )}
      </p>
      {filtered && (
        <button type="button" className="discount-clear-button" onClick={onClear}>
          {t('catalog.clear_filters', 'Filtrlarni tozalash')}
        </button>
      )}
      <Link className="gold-button" to="/products">
        {t('hero.cta_products', 'Mahsulotlarni ko‘rish')}
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
