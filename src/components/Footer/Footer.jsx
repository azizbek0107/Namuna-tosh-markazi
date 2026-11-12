import { Link } from "react-router-dom";
import { Phone, Send, Instagram, MapPin } from "lucide-react";
import Brand from "../Brand";
import useSiteSettings from "../../hooks/useSiteSettings";
import useLanguage from "../../hooks/useLanguage";
import "./Footer.css";

export default function Footer() {
  const { settings } = useSiteSettings();
  const { t } = useLanguage();

  const telegramHandle = settings?.telegramUsername || "aura_200707";
  const cleanTelegram = telegramHandle.replace(/^@/, "");
  const telegramUrl = `https://t.me/${cleanTelegram}`;

  const phoneDisplay = settings?.phone1 || "+998 90 123 45 67";
  const phoneRaw = phoneDisplay.replace(/\s+/g, "");
  const phoneHref = `tel:${phoneRaw}`;

  const instagramUrl = settings?.instagramUrl || "https://www.instagram.com/azik_axi_0107/";
  const instagramHandle = settings?.instagram
    ? `@${settings.instagram.replace(/^@/, "")}`
    : "@azik_axi_0107";

  const mapUrl = settings?.mapUrl || "https://www.google.com/maps/search/?api=1&query=Gazgon+Navoiy";
  const locationDisplay = t('contact.location_val', "G‘azg‘on sh., Navoiy viloyati");

  return (
    <footer id="boglanish" className="footer" aria-label="Sayt pastki qismi va aloqa">
      <div className="container footer-main">
        {/* Chap taraf: Brand, ta'rif va ish vaqti */}
        <div className="footer-left">
          <Brand />
          <p className="footer-tagline">
            {t('footer.tagline', 'Kerama granit va tabiiy tosh mahsulotlari markazi')}
          </p>
          <p className="footer-hours">
            <span>{t('contact.hours_label')}:</span> {t('footer.hours', 'Dushanba – Shanba, 08:00 – 18:00')}
          </p>
        </div>

        {/* O'rta qism: Sayt navigatsiyasi */}
        <div className="footer-nav-section">
          <span className="footer-section-title">{t('footer.sections', 'BO‘LIMLAR')}</span>
          <nav className="footer-nav" aria-label="Pastki navigatsiya">
            <Link to="/">{t('nav.home', 'Bosh sahifa')}</Link>
            <Link to="/products">{t('nav.products', 'Mahsulotlar')}</Link>
            <Link to="/discounts">{t('nav.discounts', 'Chegirmalar')}</Link>
            <Link to="/about">{t('nav.about', 'Biz haqimizda')}</Link>
            <Link to="/contact">{t('nav.contact', 'Bog‘lanish')}</Link>
          </nav>
        </div>

        {/* O'ng taraf: 2ta 2ta yonma-yon joylashgan aloqa, akkauntlar va lokatsiya */}
        <div className="footer-contact-section" aria-label="Bog‘lanish va lokatsiya">
          <span className="footer-section-title">{t('footer.contact_title', 'BOG‘LANISH VA LOKATSIYA')}</span>
          <div className="footer-contact-list">
            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item"
              aria-label={`Telegram: @${cleanTelegram}`}
            >
              <span className="footer-contact-icon">
                <Send size={15} aria-hidden="true" />
              </span>
              <div className="footer-contact-text">
                <span className="footer-contact-label">{t('footer.label_telegram', 'Telegram')}</span>
                <span className="footer-contact-value">@{cleanTelegram}</span>
              </div>
            </a>

            {/* Telefon */}
            <a
              href={phoneHref}
              className="footer-contact-item"
              aria-label={`Telefon: ${phoneDisplay}`}
            >
              <span className="footer-contact-icon">
                <Phone size={15} aria-hidden="true" />
              </span>
              <div className="footer-contact-text">
                <span className="footer-contact-label">{t('footer.label_phone', 'Telefon')}</span>
                <span className="footer-contact-value">{phoneDisplay}</span>
              </div>
            </a>

            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item"
              aria-label={`Instagram: ${instagramHandle}`}
            >
              <span className="footer-contact-icon">
                <Instagram size={15} aria-hidden="true" />
              </span>
              <div className="footer-contact-text">
                <span className="footer-contact-label">{t('footer.label_instagram', 'Instagram')}</span>
                <span className="footer-contact-value">{instagramHandle}</span>
              </div>
            </a>

            {/* Lokatsiya (Xarita) */}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item"
              aria-label={`Lokatsiya: ${locationDisplay}`}
            >
              <span className="footer-contact-icon">
                <MapPin size={15} aria-hidden="true" />
              </span>
              <div className="footer-contact-text">
                <span className="footer-contact-label">{t('footer.label_location', 'Lokatsiya / Manzil')}</span>
                <span className="footer-contact-value">{locationDisplay}</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ── FOOTER BOTTOM BAR ── */}
      <div className="container footer-bottom">
        <small>© {new Date().getFullYear()} {t('brand.name')}. {t('footer.rights', 'Barcha huquqlar himoyalangan.')}</small>
        <span>{t('footer.products_sub', 'KERAMA GRANIT & TOSH MAHSULOTLARI')}</span>
        <Link to="/contact" className="footer-bottom-contact">{t('footer.contact_link', 'Bog‘lanish sahifasi')}</Link>
      </div>
    </footer>
  );
}
