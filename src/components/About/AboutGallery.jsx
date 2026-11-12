import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpRight, Expand, Youtube } from 'lucide-react';
import { aboutGallery, aboutVideo } from '../../data/aboutData';
import { useLanguage } from '../../hooks/useLanguage';
import ProductImage from '../Products/ProductImage';
import AboutReveal from './AboutReveal';
import AboutGalleryModal from './AboutGalleryModal';
import './AboutGallery.css';

export default function AboutGallery() {
  const [index, setIndex] = useState(null);
  const returnFocusRef = useRef(null);
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const close = useCallback(() => setIndex(null), []);
  const move = useCallback(
    (step) =>
      setIndex((current) =>
        step === 'first'
          ? 0
          : step === 'last'
          ? aboutGallery.length - 1
          : (current + step + aboutGallery.length) % aboutGallery.length
      ),
    []
  );

  useEffect(() => {
    setIndex(null);
  }, [pathname]);

  const channelReady =
    aboutVideo.isVerified &&
    typeof aboutVideo.channelUrl === 'string' &&
    /^https:\/\/(www\.)?youtube\.com\//.test(aboutVideo.channelUrl);

  return (
    <>
      <section className="about-gallery about-section" aria-labelledby="about-gallery-title">
        <AboutReveal as="div">
          <span className="page-eyebrow">{t('about.gallery_eyebrow', '05 / GALEREYA')}</span>
          <h2 id="about-gallery-title" className="about-section-title">
            {t('about.gallery_title', 'Mahsulotlarimiz bilan yaqindan tanishing')}
          </h2>
          <p className="about-section-description">
            {t(
              'about.gallery_desc',
              'Angola Black va Black Crystal mahsulotlarining taqdim etilgan namunalari. Rasmni kattalashtirib ko‘rish uchun bosing.'
            )}
          </p>
        </AboutReveal>
        {aboutGallery.length ? (
          <div className="about-gallery-grid">
            {aboutGallery.map((item, imageIndex) => (
              <AboutReveal as="div" key={item.id} delay={imageIndex * 0.06}>
                <figure>
                  <button
                    type="button"
                    className="about-gallery-open"
                    aria-label={`${item.name}, ${imageIndex + 1}-rasmni kattalashtirish`}
                    onClick={(event) => {
                      returnFocusRef.current = event.currentTarget;
                      setIndex(imageIndex);
                    }}
                  >
                    <ProductImage image={item.image} name={item.name} />
                    <span className="about-gallery-expand" aria-hidden="true">
                      <Expand size={17} />
                    </span>
                  </button>
                  <figcaption>
                    <span>{item.name}</span>
                    <small>{String(imageIndex + 1).padStart(2, '0')}</small>
                  </figcaption>
                </figure>
              </AboutReveal>
            ))}
          </div>
        ) : (
          <p className="about-gallery-empty">{t('about.no_image', 'Mahsulot rasmlari hali qo‘shilmagan.')}</p>
        )}
      </section>

      <AboutReveal className="about-video" aria-labelledby="about-video-title">
        <Youtube size={38} strokeWidth={1.2} aria-hidden="true" />
        <div>
          <span className="page-eyebrow">{t('about.video_eyebrow', 'VIDEO /')} {aboutVideo.channelName}</span>
          <h2 id="about-video-title">
            {t('about.video_title', 'Ishlab chiqarish videolarini YouTube kanalimizda kuzatib boring')}
          </h2>
          <p id="about-video-status">
            {channelReady
              ? t('about.video_ready', 'Kanalda e’lon qilingan videolar bilan tanishing.')
              : t('about.video_pending', 'Kanal havolasi tasdiqlangach, shu yerdan o‘tishingiz mumkin.')}
          </p>
        </div>
        {channelReady ? (
          <a
            href={aboutVideo.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="about-video-link"
          >
            {t('about.video_cta', 'YouTube kanalga o‘tish')}
            <ArrowUpRight size={16} aria-hidden="true" />
            <span className="sr-only"> (yangi oynada ochiladi)</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="about-video-link"
            aria-describedby="about-video-status"
          >
            {t('about.video_cta', 'YouTube kanalga o‘tish')}
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        )}
      </AboutReveal>

      {index !== null && aboutGallery[index] && (
        <AboutGalleryModal
          images={aboutGallery}
          index={index}
          onClose={close}
          onMove={move}
          returnFocusRef={returnFocusRef}
        />
      )}
    </>
  );
}
