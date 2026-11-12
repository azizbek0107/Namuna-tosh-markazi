import { motion, useReducedMotion } from 'motion/react';
import { BadgePercent } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import './DiscountHero.css';

export default function DiscountHero({ activeCount = 0 }) {
  const reduced = useReducedMotion();
  const { t } = useLanguage();

  return (
    <motion.header
      className="discount-hero"
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.4 }}
    >
      <div className="discount-hero-geometry" aria-hidden="true">
        <BadgePercent strokeWidth={0.7} />
      </div>
      <span className="page-eyebrow">
        <span /> {t('discounts.eyebrow', 'CHEGIRMALAR VA AKSIYALAR')}
      </span>
      <h1>{t('discounts.hero_title', 'MAXSUS TAKLIFLAR')}</h1>
      <h2>{t('discounts.hero_subtitle', 'Sifatli mahsulotlar — qulay narxlarda')}</h2>
      <p>{t('discounts.desc', 'Namuna Tosh Markazining amaldagi chegirmalari va maxsus takliflari bilan tanishing.')}</p>
      <div className="discount-hero-status">
        {activeCount > 0
          ? `${activeCount} ${t('discounts.hero_status', 'ta faol taklif')}`
          : t('discounts.hero_no_active', 'Hozircha faol aksiya yo‘q')}
      </div>
      <motion.div
        className="discount-hero-line"
        aria-hidden="true"
        initial={{ scaleX: reduced ? 1 : 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduced ? 0 : 0.45 }}
      />
    </motion.header>
  );
}
