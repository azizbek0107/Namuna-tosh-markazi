import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="container not-found">
      <span className="page-eyebrow">404 / SAHIFA TOPILMADI</span>
      <h1>Bu yerda sahifa yo‘q.</h1>
      <Link className="gold-button" to="/">
        Bosh sahifaga qaytish
      </Link>
    </section>
  );
}
