import { productionSteps } from '../../data/aboutData';
import { useLanguage } from '../../hooks/useLanguage';
import AboutReveal from './AboutReveal';
import AboutIcon from './AboutIcon';
import './ProductionProcess.css';

export default function ProductionProcess() {
  const { t } = useLanguage();

  return (
    <section className="about-process about-section" aria-labelledby="production-title">
      <AboutReveal as="div">
        <span className="page-eyebrow">{t('about.process_eyebrow', '02 / JARAYON')}</span>
        <h2 id="production-title" className="about-section-title">
          {t('about.process_title', 'Mahsulot qanday tayyorlanadi?')}
        </h2>
        <p className="about-section-description">
          {t(
            'about.process_desc',
            'Umumiy ishlov berish bosqichlari. Aniq ishlar va ularning ketma-ketligi mahsulot hamda buyurtma talabiga qarab belgilanadi.'
          )}
        </p>
      </AboutReveal>
      <ol className="production-timeline">
        {productionSteps.map((step, index) => (
          <AboutReveal as="li" key={step.id} delay={index * 0.04}>
            <div className="process-step-mark">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <AboutIcon name={step.icon} size={22} strokeWidth={1.3} />
            </div>
            <h3>{t(`about.step_${index + 1}_title`, step.title)}</h3>
            <p>{t(`about.step_${index + 1}_desc`, step.description)}</p>
          </AboutReveal>
        ))}
      </ol>
    </section>
  );
}
