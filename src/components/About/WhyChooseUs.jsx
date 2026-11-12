import { companyServices } from '../../data/aboutData';
import AboutIcon from './AboutIcon';
import AboutReveal from './AboutReveal';
import useLanguage from '../../hooks/useLanguage';
import './WhyChooseUs.css';

export default function WhyChooseUs({ eyebrow = "04 / XIZMATLARIMIZ" }) {
  const { t } = useLanguage();

  return (
    <section className="about-services about-section" aria-labelledby="why-title">
      <AboutReveal as="div">
        <span className="page-eyebrow">{eyebrow}</span>
        <h2 id="why-title" className="about-section-title">{t('why.title', 'Nega Namuna Tosh Markazi?')}</h2>
        <p className="about-section-description">
          {t('why.description', 'Buyurtmangizga mos material, o‘lcham va ishlov bo‘yicha birgalikda qaror qilamiz.')}
        </p>
      </AboutReveal>
      <div className="about-services-grid">
        {companyServices.map((service, index) => (
          <AboutReveal
            as="article"
            key={service.id}
            delay={(index % 3) * 0.06}
            className="about-service-card"
          >
            <AboutIcon name={service.icon} size={27} strokeWidth={1.2} />
            <h3>{t(`why.service_${index + 1}_title`, service.title)}</h3>
            <p>{t(`why.service_${index + 1}_desc`, service.description)}</p>
          </AboutReveal>
        ))}
      </div>
    </section>
  );
}
