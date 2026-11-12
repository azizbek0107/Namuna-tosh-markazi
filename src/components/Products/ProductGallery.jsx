import useLanguage from '../../hooks/useLanguage';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import ProductImage from './ProductImage';
import './ProductGallery.css';

export default function ProductGallery({ images = [], name }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const touch = useRef(null);
  const reduced = useReducedMotion();
  const count = images.length;
  const move = step => { if (count > 1) setIndex(current => (current + step + count) % count); };
  return <div className="product-gallery" role="region" aria-label={`${name} rasmlari`} tabIndex={0} onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } }}>
    <div className="gallery-stage" onTouchStart={event => { const point = event.touches[0]; touch.current = point ? { x: point.clientX, y: point.clientY } : null; }} onTouchCancel={() => { touch.current = null; }} onTouchEnd={event => { const start = touch.current; touch.current = null; const point = event.changedTouches[0]; if (start && point && Math.abs(point.clientX - start.x) > 50 && Math.abs(point.clientX - start.x) > Math.abs(point.clientY - start.y)) move(point.clientX > start.x ? -1 : 1); }}>
      <AnimatePresence mode="wait" initial={false}><motion.div key={index} initial={{ opacity: 0, x: reduced ? 0 : 7 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .25 }}><ProductImage image={images[index]} name={name} priority /></motion.div></AnimatePresence>
      <div className="gallery-navigation"><button type="button" className="icon-button" disabled={count < 2} onClick={() => move(-1)} aria-label={t('gallery.previous')}><ArrowLeft size={18} aria-hidden="true" /></button><span aria-live="polite">{count ? index + 1 : 0} / {count}</span><button type="button" className="icon-button" disabled={count < 2} onClick={() => move(1)} aria-label={t('gallery.next')}><ArrowRight size={18} aria-hidden="true" /></button></div>
      {count > 1 && <div className="gallery-thumbnails" role="group" aria-label={t('gallery.choose')}>{images.map((image, itemIndex) => <button type="button" key={image.src ?? image} aria-label={`${itemIndex + 1}-rasmni ko‘rish`} aria-pressed={index === itemIndex} onClick={() => setIndex(itemIndex)}><ProductImage image={typeof image === 'string' ? { src: image, alt: '' } : { ...image, alt: '' }} name={name} /></button>)}</div>}
      <p className="gallery-note">{t('gallery.note')}</p>
    </div>
  </div>;
}
