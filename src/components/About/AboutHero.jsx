import { motion, useReducedMotion } from 'motion/react';
import { aboutHero } from '../../data/aboutData';
import { useLanguage } from '../../hooks/useLanguage';
import ProductImage from '../Products/ProductImage';
import './AboutHero.css';

export default function AboutHero() {
  const reduced = useReducedMotion();
  const { t } = useLanguage();

  return (
    <header className="about-hero">
      <motion.div
        className="about-hero-copy"
        initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
      >
        <span className="page-eyebrow">
          <span /> {t('about.hero_eyebrow', '01 / BIZ HAQIMIZDA')}
        </span>
        <h1>{t('brand.title')}</h1>
        <h2>{t('about.hero_subtitle', aboutHero.subtitle)}</h2>
        <p>{t('about.hero_desc', aboutHero.description)}</p>
        <div className="about-hero-signature">
          <span aria-hidden="true" />
          {t('about.hero_signature', 'MATERIAL. O‘LCHAM. ISHLOV.')}
        </div>
      </motion.div>
      <motion.figure
        className="about-hero-visual"
        initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.08 }}
      >
        <div className="about-hero-image">
          <ProductImage image={aboutHero.image} name={aboutHero.imageName} priority />
        </div>
        <figcaption>
          <span>{t('catalog.sample_count', 'MAHSULOT NAMUNASI')}</span>
          <strong>{aboutHero.imageName}</strong>
        </figcaption>
      </motion.figure>
    </header>
  );
}
