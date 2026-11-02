import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Hero from "../../components/Hero/Hero";
import HeroStats from "../../components/HeroStats/HeroStats";
import ScrollIndicator from "../../components/ScrollIndicator/ScrollIndicator";
import "./Home.css";

export default function Home() {
  return (
    <>
      <Hero>
        <HeroStats />
        <ScrollIndicator targetId="mahsulotlar-preview" />
      </Hero>
      <section
        id="mahsulotlar-preview"
        className="home-preview container"
        tabIndex={-1}
        aria-labelledby="preview-title"
      >
        <div>
          <span className="page-eyebrow">
            <span /> KEYINGI QADAM / MAHSULOTLAR
          </span>
          <h2 id="preview-title">
            Har bir makonning
            <br />
            <em>o‘z xarakteri bor.</em>
          </h2>
        </div>
        <div>
          <p>
            Kerama granit, sokl va zinapoya yo‘nalishlari bilan tanishing.
            Material va ishlov haqidagi savollaringizni loyihangizga mos
            ravishda muhokama qilamiz.
          </p>
          <Link className="text-link" to="/products">
            Mahsulotlar bo‘limiga o‘tish{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
