import useLanguage from '../../hooks/useLanguage';
import { Link } from "react-router-dom";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <section className="container not-found">
      <span className="page-eyebrow">{t('not_found.eyebrow')}</span>
      <h1>{t('not_found.title')}</h1>
      <Link className="gold-button" to="/">
        {t('not_found.home')}
      </Link>
    </section>
  );
}
