import { ArrowDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import "./ScrollIndicator.css";

export default function ScrollIndicator({ targetId }) {
  const reduced = useReducedMotion();
  function scroll() {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({
      behavior: reduced ? "instant" : "smooth",
      block: "start",
    });
    target.focus({ preventScroll: true });
  }
  return (
    <button
      type="button"
      className="scroll-indicator"
      onClick={scroll}
      aria-controls={targetId}
    >
      <span>Pastga aylantiring</span>
      <motion.span
        aria-hidden="true"
        animate={reduced ? { y: 0 } : { y: [0, 4, 0] }}
        transition={{
          duration: reduced ? 0 : 1.8,
          repeat: reduced ? 0 : Infinity,
          ease: "easeInOut",
        }}
      >
        <ArrowDown size={16} strokeWidth={1.3} />
      </motion.span>
    </button>
  );
}
