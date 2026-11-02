import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { heroProducts } from "../../data/heroProducts";
import ProductSlide from "./ProductSlide";
import "./ProductCarousel.css";

export default function ProductCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const touch = useRef(null);
  const reduced = useReducedMotion();
  const count = heroProducts.length;
  const playing = !paused && !hovered && !focusPaused && !hidden && !reduced;
  const move = useCallback(
    (step) => setIndex((current) => (current + step + count) % count),
    [count],
  );

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => move(1), 5000);
    return () => clearInterval(timer);
  }, [playing, index, move]);

  function handleKey(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const actions = {
      ArrowLeft: () => move(-1),
      ArrowRight: () => move(1),
      Home: () => setIndex(0),
      End: () => setIndex(count - 1),
    };
    if (actions[event.key]) {
      event.preventDefault();
      actions[event.key]();
    }
  }
  function swipeEnd(event) {
    const start = touch.current;
    touch.current = null;
    if (!start || !event.changedTouches.length) return;
    const end = event.changedTouches[0];
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? -1 : 1);
  }
  function togglePlayback() {
    if (paused || focusPaused) {
      setPaused(false);
      setFocusPaused(false);
    } else setPaused(true);
  }

  return (
    <section
      className="product-carousel"
      role="region"
      aria-roledescription="karusel"
      aria-label="Mahsulot namunalari"
      tabIndex={0}
      onKeyDown={handleKey}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocusPaused(true);
      }}
    >
      <div className="carousel-topline">
        <span>MAHSULOT NAMUNALARI</span>
        <span aria-hidden="true">
          0{index + 1} / 0{count}
        </span>
      </div>
      <div
        className="carousel-view"
        aria-live={playing ? "off" : "polite"}
        aria-atomic="true"
        onTouchStart={(event) => {
          const point = event.touches[0];
          touch.current = point ? { x: point.clientX, y: point.clientY } : null;
        }}
        onTouchEnd={swipeEnd}
        onTouchCancel={() => {
          touch.current = null;
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={heroProducts[index].id}
            initial={{ opacity: 0, x: reduced ? 0 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : -10 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <ProductSlide
              product={heroProducts[index]}
              index={index}
              count={count}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="carousel-controls">
        <div className="carousel-arrows">
          <button
            type="button"
            className="icon-button"
            onClick={() => move(-1)}
            aria-label="Oldingi mahsulot"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => move(1)}
            aria-label="Keyingi mahsulot"
          >
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div
          className="carousel-dots"
          role="group"
          aria-label="Slaydni tanlash"
        >
          {heroProducts.map((product, itemIndex) => (
            <button
              type="button"
              key={product.id}
              className={`carousel-dot${itemIndex === index ? " selected" : ""}`}
              aria-label={`${itemIndex + 1}-slayd: ${product.name}`}
              aria-current={itemIndex === index ? "true" : undefined}
              onClick={() => setIndex(itemIndex)}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="icon-button carousel-play"
          onClick={togglePlayback}
          disabled={reduced}
          aria-label={
            reduced
              ? "Kamaytirilgan harakat rejimida avtomatik almashish o‘chiq"
              : paused || focusPaused
                ? "Avtomatik almashishni boshlash"
                : "Avtomatik almashishni to‘xtatish"
          }
        >
          {paused || focusPaused || reduced ? (
            <Play size={16} aria-hidden="true" />
          ) : (
            <Pause size={16} aria-hidden="true" />
          )}
        </button>
      </div>
      <p className="carousel-note">
        Rang va naqsh asl rasmlarda ko‘rsatilgan. Tafsilotlarni buyurtma vaqtida
        aniqlashtiring.
      </p>
    </section>
  );
}
