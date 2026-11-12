import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import OrderButton from "./OrderButton";
import useLanguage from '../hooks/useLanguage';

export default function PagePlaceholder({
  number,
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}) {
  const { t } = useLanguage();
  return (
    <section className="placeholder-page container">
      <div className="page-eyebrow">
        <span />
        {number} / {eyebrow}
      </div>
      <div className="placeholder-grid">
        <div>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
          {children}
          <div className="placeholder-actions">
            <OrderButton />
            <Link className="text-link" to="/">
              <ArrowLeft size={16} aria-hidden="true" /> Bosh sahifaga
            </Link>
          </div>
        </div>
        <div className="placeholder-art" aria-hidden="true">
          <span className="placeholder-orbit" />
          <Icon size={72} strokeWidth={0.7} />
          <span className="art-caption">{t('brand.short')} / {t('brand.descriptor')}</span>
        </div>
      </div>
      <div className="page-bottom-line">
        <span>{eyebrow}</span>
        <span>HAR BIR DETAL — MUHIM.</span>
      </div>
    </section>
  );
}
