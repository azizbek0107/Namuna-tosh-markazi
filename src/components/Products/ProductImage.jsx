import useLanguage from '../../hooks/useLanguage';
import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function ProductImage({ image, name, className = '', priority = false }) {
  const { t } = useLanguage();
  const source = typeof image === 'string' ? image : image?.src;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  if (!source || failed) return <div className={`catalog-image-placeholder ${className}`} role="img" aria-label={`${name}: ${t('common.no_image')}`}><ImageOff size={30} strokeWidth={1} aria-hidden="true" /><span>{t('common.no_image')}</span></div>;
  return <img className={className} src={source} alt={image?.alt ?? name} width={image?.width ?? 1024} height={image?.height ?? 1536} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" draggable="false" onError={() => setFailed(true)} />;
}
