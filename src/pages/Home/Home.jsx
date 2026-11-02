import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Layers3,
  MoveUpRight,
  SquareStack,
} from "lucide-react";
import "./Home.css";
import ProductCarousel from "../../components/ProductCarousel/ProductCarousel";

export default function Home() {
  return (
    <section className="home-page container">
      <div className="home-topline">
        <span className="page-eyebrow">
          <span /> TOSHNING XARAKTERI. MAKONNING RUHI.
        </span>
        <span className="edition-label">NAMUNA COLLECTION</span>
      </div>
      <div className="home-grid">
        <div className="home-copy">
          <div className="home-kicker">NAMUNA TOSH MARKAZI</div>
          <h1>
            Mustahkamlik.
            <br />
            Nafosat.
            <br />
            <em>Mukammal uyg‘unlik.</em>
          </h1>
          <p>
            Kerama granit va tosh mahsulotlari.
            <br />
            Makoningizning har bir detaliga munosib tanlov.
          </p>
          <div className="home-actions">
            <Link className="gold-button" to="/products">
              Mahsulotlar <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link className="text-link" to="/about">
              Biz bilan tanishing{" "}
              <span className="round-arrow">
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </Link>
          </div>
          <div className="home-caption">
            <span /> TABIIY FAKTURA. ZAMONAVIY QARASH.
          </div>
        </div>
        <ProductCarousel />
      </div>
      <div className="home-bottom">
        <span className="home-bottom-label">
          MAHSULOT YO‘NALISHLARI
          <ArrowDownRight size={18} strokeWidth={1} aria-hidden="true" />
        </span>
        <div className="home-categories">
          {[
            { name: "Kerama granit", Icon: Layers3 },
            { name: "Sokl mahsulotlari", Icon: SquareStack },
            { name: "Zinapoyalar", Icon: MoveUpRight },
          ].map(({ name, Icon }) => (
            <Link to="/products" key={name}>
              <Icon size={20} strokeWidth={1} aria-hidden="true" />
              <span>{name}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
