import { Link } from 'react-router-dom';
import { ArrowUpRight, BadgePercent } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import useProductData from '../../hooks/useProductData';
import { useCurrentTime } from '../../hooks/useCountdown';
import { getActiveDiscounts } from '../../utils/discountUtils';
import useLanguage from '../../hooks/useLanguage';
import './DiscountBanner.css';

export default function DiscountBanner() {
  const { data: products, loading, error } = useProductData();
  const now = useCurrentTime(products.length > 0);
  const reduced = useReducedMotion();
  const { t } = useLanguage();

  if (loading || error || !getActiveDiscounts(products, now).length) return null;

  return (
    <motion.aside
      className="discount-banner container"
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
      aria-label={t('discounts.banner_label', 'Faol aksiyalar')}
    >
      <Link to="/discounts">
        <BadgePercent size={28} strokeWidth={1} aria-hidden="true" />
        <div>
          <span>{t('discounts.hero_title', 'MAXSUS TAKLIFLAR')}</span>
          <strong>{t('discounts.banner_title', 'Maxsus chegirmalar')}</strong>
          <p>{t('discounts.banner_desc', 'Amaldagi aksiyalar bilan tanishing.')}</p>
        </div>
        <ArrowUpRight size={24} aria-hidden="true" />
      </Link>
    </motion.aside>
  );
}
