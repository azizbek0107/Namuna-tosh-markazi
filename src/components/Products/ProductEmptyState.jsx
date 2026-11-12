import useLanguage from '../../hooks/useLanguage';
import { SearchX } from 'lucide-react';

export default function ProductEmptyState({ onClear, message }) {
  const { t } = useLanguage();
  return <div className="catalog-empty" role="status"><SearchX size={38} strokeWidth={1} aria-hidden="true" /><h2>{t('catalog.empty_title')}</h2><p>{message || t('catalog.empty_detail')}</p><button type="button" onClick={onClear} className="catalog-reset-button">{t('catalog.clear_filters')}</button></div>;
}
