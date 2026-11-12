import { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import useLanguage from '../../hooks/useLanguage';
import './LanguageSelector.css';

export default function LanguageSelector({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { language, setLanguage, currentLanguage, languages, t } = useLanguage();

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  const handleSelect = (code) => {
    setLanguage(code);
    close();
    buttonRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`lang-selector-wrap${isOpen ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
    >
      <button
        ref={buttonRef}
        type="button"
        className="lang-selector-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t('lang.select', 'Tilni tanlash')} (${currentLanguage.name})`}
        title={`${t('lang.select', 'Tilni tanlash')}: ${currentLanguage.name}`}
      >
        <Globe size={16} className="lang-globe-icon" aria-hidden="true" />
        <span className="lang-code-text">{currentLanguage.short}</span>
        <ChevronDown
          size={13}
          className={`lang-chevron-icon${isOpen ? ' is-rotated' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lang-dropdown-menu"
            role="listbox"
            aria-label={t('lang.select', 'Tilni tanlash')}
            initial={{ opacity: 0, y: reducedMotion ? 0 : -6, scale: reducedMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -6, scale: reducedMotion ? 1 : 0.98 }}
            transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
          >
            <div className="lang-dropdown-header">
              <span>{t('lang.select', 'Tilni tanlash')}</span>
            </div>

            <ul className="lang-options-list">
              {languages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <li key={lang.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`lang-option-btn${isSelected ? ' is-selected' : ''}`}
                      onClick={() => handleSelect(lang.code)}
                    >
                      <span className="lang-flag" aria-hidden="true">
                        {lang.flag}
                      </span>
                      <span className="lang-name-wrap">
                        <span className="lang-primary-name">{lang.name}</span>
                        <span className="lang-sub-badge">{lang.sub}</span>
                      </span>
                      {isSelected && (
                        <Check size={14} className="lang-check-icon" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

