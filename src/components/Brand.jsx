import { Link } from "react-router-dom";

export default function Brand({ onClick }) {
  return (
    <Link
      className="brand"
      to="/"
      onClick={onClick}
      aria-label="Namuna Tosh Markazi — bosh sahifa"
    >
      <span className="brand-mark" aria-hidden="true">
        N<span>Т</span>
      </span>
      <span className="brand-wordmark">
        NAMUNA<span>TOSH MARKAZI</span>
      </span>
    </Link>
  );
}
