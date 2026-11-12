import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Hero from "../../components/Hero/Hero";
import HeroStats from "../../components/HeroStats/HeroStats";
import ScrollIndicator from "../../components/ScrollIndicator/ScrollIndicator";
import DiscountBanner from '../../components/Discounts/DiscountBanner';
import WhyChooseUs from '../../components/About/WhyChooseUs';
import useLanguage from '../../hooks/useLanguage';
import "./Home.css";

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      <Hero>
        <HeroStats />
        <ScrollIndicator targetId="mahsulotlar-preview" />
      </Hero>
      <DiscountBanner />
      <section
        id="mahsulotlar-preview"
        className="home-preview container"
        tabIndex={-1}
        aria-labelledby="preview-title"
      >
        <div>
          <span className="page-eyebrow">
            <span /> {t('home.preview_eyebrow', 'KEYINGI QADAM / MAHSULOTLAR')}
          </span>
          <h2 id="preview-title">
            {t('home.preview_title_1', 'Har bir makonning')}
            <br />
            <em>{t('home.preview_title_2', 'o‘z xarakteri bor.')}</em>
          </h2>
        </div>
        <div>
          <p>
            {t('home.preview_desc', 'Kerama granit, granit, kafel va tabiiy tosh mahsulotlari bilan tanishing. Material va ishlov haqidagi savollaringizni loyihangizga mos ravishda muhokama qilamiz.')}
          </p>
          <Link className="text-link" to="/products">
            {t('home.preview_cta', 'Mahsulotlar bo‘limiga o‘tish')}{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <div className="container home-why-wrapper">
        <WhyChooseUs eyebrow={t('home.why_eyebrow', 'AFZALLIKLARIMIZ / XIZMATLAR')} />
      </div>
    </>
  );
}
