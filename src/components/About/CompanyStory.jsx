import { companyStory } from '../../data/aboutData';
import { useLanguage } from '../../hooks/useLanguage';
import AboutReveal from './AboutReveal';
import './CompanyStory.css';

export default function CompanyStory() {
  const { t } = useLanguage();

  const paragraphs = [
    t('about.story_p1', companyStory[0]),
    t('about.story_p2', companyStory[1]),
  ];

  return (
    <AboutReveal className="about-story about-section" aria-labelledby="company-story-title">
      <div>
        <span className="page-eyebrow">{t('about.story_eyebrow', '01 / MARKAZIMIZ')}</span>
        <h2 id="company-story-title" className="about-section-title">
          {t('about.story_title', 'Biz haqimizda')}
        </h2>
        <p className="about-story-note">
          {t('about.story_note', 'Materialdan tayyor mahsulotgacha.')}
        </p>
      </div>
      <div className="about-story-copy">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </AboutReveal>
  );
}
