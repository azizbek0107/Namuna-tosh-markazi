import HeroContent from "./HeroContent";
import HeroVisual from "./HeroVisual";
import "./Hero.css";

export default function Hero({ children }) {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="container hero-container">
        <div className="hero-grid">
          <HeroContent />
          <HeroVisual />
        </div>
        {children}
      </div>
    </section>
  );
}
