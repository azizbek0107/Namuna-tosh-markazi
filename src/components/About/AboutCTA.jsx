import { Link } from 'react-router-dom';
import { ArrowUpRight, Send } from 'lucide-react';
import { orderUrl } from '../Navbar/navigation';
import { useLanguage } from '../../hooks/useLanguage';
import AboutReveal from './AboutReveal';
import './AboutCTA.css';

export default function AboutCTA() {
  const { t } = useLanguage();

  return (
    <AboutReveal className="about-cta" aria-labelledby="about-cta-title">
      <div>
        <span className="page-eyebrow">{t('nav.start_together', 'LOYIHANGIZNI BIRGA MUHOKAMA QILAMIZ')}</span>
        <h2 id="about-cta-title">{t('about.cta_title', 'Loyihangiz uchun mos mahsulot izlayapsizmi?')}</h2>
        <p>{t('about.cta_desc', 'Kerama granit, granit, kafel va boshqa tabiiy tosh mahsulotlari bo‘yicha biz bilan bog‘laning.')}</p>
      </div>
      <div className="about-cta-actions">
        <Link className="gold-button" to="/products">
          {t('about.cta_btn', 'Mahsulotlarni ko‘rish')}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
        <a className="about-telegram-link" href={orderUrl} target="_blank" rel="noopener noreferrer">
          <Send size={17} aria-hidden="true" />
          {t('hero.cta_telegram', 'Telegram orqali bog‘lanish')}
          <span className="sr-only"> (yangi oynada ochiladi)</span>
        </a>
      </div>
    </AboutReveal>
  );
}
