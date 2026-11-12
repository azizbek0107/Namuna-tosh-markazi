import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { resolveProductDirections } from '../../data/aboutData';
import { categoryName } from '../../data/categories';
import { useLanguage } from '../../hooks/useLanguage';
import useProductData from '../../hooks/useProductData';
import AboutReveal from './AboutReveal';
import './ProductDirections.css';

export default function ProductDirections() {
  const { t, language } = useLanguage();
  const { data: products } = useProductData();
  const [failedSources, setFailedSources] = useState(() => new Set());
  const directions = resolveProductDirections(products, failedSources);

  if (directions.length === 0) return null;

  return (
    <section className="about-directions about-section" aria-labelledby="directions-title">
      <AboutReveal as="div">
        <span className="page-eyebrow">{t('about.directions_eyebrow', '03 / MAHSULOTLAR')}</span>
        <h2 id="directions-title" className="about-section-title">
          {t('about.directions_title', 'Mahsulot yo‘nalishlari')}
        </h2>
        <p className="about-section-description">
          {t('about.directions_desc', 'Material va ishlov turini loyihangizga mos tanlang. Mavjud namunalar bilan katalogda tanishing.')}
        </p>
      </AboutReveal>
      <div className="about-directions-grid">
        {directions.map((direction, index) => {
          const localizedTitle = categoryName(direction.id, language) || direction.title;
          return (
            <AboutReveal as="article" key={direction.id} delay={(index % 3) * 0.06} className="about-direction-card">
              <div className="about-direction-image">
                <img
                  key={direction.image.src}
                  src={direction.image.src}
                  alt={localizedTitle}
                  width={direction.image.width || 1024}
                  height={direction.image.height || 1024}
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailedSources(current => new Set([...current, direction.image.src]))}
                />
              </div>
              <div className="about-direction-copy">
                <h3>{localizedTitle}</h3>
                <p>{direction.description}</p>
                <Link to={`/products?category=${direction.id}`}>
                  {localizedTitle} {t('about.direction_link', 'mahsulotlari')}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </AboutReveal>
          );
        })}
      </div>
    </section>
  );
}
