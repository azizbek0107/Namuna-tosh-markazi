import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import ProductImage from '../Products/ProductImage';
import './AboutGalleryModal.css';
import useLanguage from '../../hooks/useLanguage';

export default function AboutGalleryModal({ images, index, onClose, onMove, returnFocusRef }) {
  const panelRef = useRef(null);
  const { t } = useLanguage();
  const closeRef = useRef(null);
  const reduced = useReducedMotion();
  const item = images[index];
  useLayoutEffect(() => {
    const shell = document.getElementById('site-shell');
    const previousInert = shell?.inert;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const opener = returnFocusRef.current ?? document.activeElement;
    const routeAtOpen = window.location.pathname;
    const scrollbar = document.documentElement.clientWidth > 0 ? Math.max(0, window.innerWidth - document.documentElement.clientWidth) : 0;
    if (shell) shell.inert = true;
    document.body.style.overflow = 'hidden';
    if (scrollbar) document.body.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus();
    function key(event) {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); return; }
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        onMove(event.key === 'Home' ? 'first' : event.key === 'End' ? 'last' : event.key === 'ArrowLeft' ? -1 : 1);
      }
      if (event.key === 'Tab') {
        const buttons = [...panelRef.current.querySelectorAll('button:not([disabled])')];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    function containFocus(event) {
      if (!panelRef.current?.contains(event.target)) closeRef.current?.focus();
    }
    document.addEventListener('keydown', key);
    document.addEventListener('focusin', containFocus);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('focusin', containFocus);
      if (shell) shell.inert = previousInert ?? false;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (!shell?.inert) {
        const target = window.location.pathname === routeAtOpen && opener?.isConnected ? opener : document.getElementById('main-content');
        target?.focus({ preventScroll: true });
      }
    };
  }, [onClose, onMove, returnFocusRef]);
  return createPortal(<motion.div className="about-lightbox-layer" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .2 }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div ref={panelRef} className="about-lightbox" role="dialog" aria-modal="true" aria-labelledby="about-lightbox-title" aria-describedby="about-lightbox-help"><header className="about-lightbox-header"><h2 id="about-lightbox-title">{t('gallery.title')}</h2><button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label={t('gallery.close')}><X size={23} aria-hidden="true" /></button></header><figure><motion.div className="about-lightbox-stage" key={item.id} initial={{ opacity: reduced ? 1 : .4 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .25 }}><ProductImage image={item.image} name={item.name} priority /></motion.div><figcaption aria-live="polite" aria-atomic="true"><span>{item.name}</span><span className="about-lightbox-count">{index + 1} / {images.length}</span></figcaption></figure><div className="about-lightbox-controls"><button type="button" className="icon-button" disabled={images.length < 2} onClick={() => onMove(-1)} aria-label={t('gallery.modal_previous')}><ArrowLeft size={20} aria-hidden="true" /></button><p id="about-lightbox-help">{t('gallery.keys')}</p><button type="button" className="icon-button" disabled={images.length < 2} onClick={() => onMove(1)} aria-label={t('gallery.modal_next')}><ArrowRight size={20} aria-hidden="true" /></button></div></div></motion.div>, document.body);
}
