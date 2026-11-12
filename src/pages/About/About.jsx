import AboutHero from '../../components/About/AboutHero';
import CompanyStory from '../../components/About/CompanyStory';
import ProductionProcess from '../../components/About/ProductionProcess';
import ProductDirections from '../../components/About/ProductDirections';
import WhyChooseUs from '../../components/About/WhyChooseUs';
import AboutGallery from '../../components/About/AboutGallery';
import AboutCTA from '../../components/About/AboutCTA';
import useLanguage from '../../hooks/useLanguage';
import './About.css';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="about-page container">
      <AboutHero />
      <CompanyStory />
      <ProductionProcess />
      <ProductDirections />
      <WhyChooseUs eyebrow={t('about.services_eyebrow', '04 / XIZMATLARIMIZ')} />
      <AboutGallery />
      <AboutCTA />
    </div>
  );
}
