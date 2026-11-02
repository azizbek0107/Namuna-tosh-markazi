import { Link } from "react-router-dom";
import logo from "../assets/images/namuna-logo.jpg";

export default function Brand({ onClick }) {
  return (
    <Link
      className="brand"
      to="/"
      onClick={onClick}
      aria-label="Namuna Tosh Markazi — bosh sahifa"
    >
      <img
        className="brand-logo"
        src={logo}
        width="1609"
        height="977"
        alt="Namuna Tosh Jilo logotipi"
      />
    </Link>
  );
}
