import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import ProductCarousel from "../ProductCarousel/ProductCarousel";
import { heroSlides } from "../../data/heroData";
import { heroEase } from "./heroMotion";

export default function HeroVisual() {
  const reduced = useReducedMotion();
  const visualRef = useRef(null);
  const bounds = useRef(null);
  const [visible, setVisible] = useState(true);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 90, damping: 24 });
  const y = useSpring(pointerY, { stiffness: 90, damping: 24 });

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(visualRef.current);
    return () => observer.disconnect();
  }, []);

  function enter(event) {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    bounds.current = event.currentTarget.getBoundingClientRect();
  }
  function move(event) {
    const rect = bounds.current;
    if (!rect || reduced || event.pointerType !== "mouse") return;
    pointerX.set(
      Math.max(
        -4,
        Math.min(4, ((event.clientX - rect.left) / rect.width - 0.5) * 8),
      ),
    );
    pointerY.set(
      Math.max(
        -3,
        Math.min(3, ((event.clientY - rect.top) / rect.height - 0.5) * 6),
      ),
    );
  }
  function reset() {
    bounds.current = null;
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.div
      ref={visualRef}
      className="hero-visual"
      initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reduced ? 0 : 0.75,
        delay: reduced ? 0 : 0.48,
        ease: heroEase,
      }}
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      <div className="hero-visual-glow" aria-hidden="true" />
      <div className="hero-visual-orbit" aria-hidden="true" />
      <span className="hero-visual-corner corner-top" aria-hidden="true" />
      <span className="hero-visual-corner corner-bottom" aria-hidden="true" />
      <motion.div
        className="hero-parallax-layer"
        style={{ x: reduced ? 0 : x, y: reduced ? 0 : y }}
      >
        <motion.div
          className="hero-floating-layer"
          animate={
            reduced || !visible
              ? { y: 0, scale: 1 }
              : { y: [0, -4, 0], scale: [1, 1.003, 1] }
          }
          transition={{
            duration: reduced ? 0 : 7,
            repeat: reduced || !visible ? 0 : Infinity,
            ease: "easeInOut",
          }}
        >
          <ProductCarousel products={heroSlides} />
        </motion.div>
      </motion.div>
      <span className="hero-visual-footnote" aria-hidden="true">
        TOSH / FAKTURA / NAFOSAT
      </span>
    </motion.div>
  );
}
