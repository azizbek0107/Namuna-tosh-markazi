import { Link } from "react-router-dom";
import Brand from "../Brand";
import { ArrowUpRight } from "lucide-react";
import { orderUrl } from "../Navbar/navigation";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <Brand />
        <p>Makoningizga munosib tanlov.</p>
        <a href={orderUrl} target="_blank" rel="noopener noreferrer">
          Telegram orqali bog‘lanish{" "}
          <ArrowUpRight size={15} aria-hidden="true" />
          <span className="sr-only"> (yangi oynada)</span>
        </a>
      </div>
      <div className="container footer-bottom">
        <small>© {new Date().getFullYear()} Namuna Tosh Markazi</small>
        <span>KERAMA GRANIT & TOSH MAHSULOTLARI</span>
        <Link to="/contact">Bog‘lanish</Link>
      </div>
    </footer>
  );
}
