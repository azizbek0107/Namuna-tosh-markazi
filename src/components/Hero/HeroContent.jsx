import { motion, useReducedMotion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { heroData } from "../../data/heroData";
import HeroActions from "./HeroActions";
import { revealItem } from "./heroMotion";

export default function HeroContent() {
  const reduced = useReducedMotion();
  const item = revealItem(reduced);
  const [brand, ...title] = heroData.title.split(" ");
  return (
    <motion.div
      className="hero-content"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : 0.09,
            delayChildren: reduced ? 0 : 0.04,
          },
        },
      }}
    >
      <motion.div className="hero-badge" variants={item}>
        <Sparkles size={12} strokeWidth={1.5} aria-hidden="true" />
        <span>{heroData.badge}</span>
      </motion.div>
      <motion.h1 id="hero-title" className="hero-title" variants={item}>
        <span>{brand}</span> <span>{title.join(" ")}</span>
      </motion.h1>
      <motion.p className="hero-subtitle" variants={item}>
        {heroData.subtitle}
      </motion.p>
      <motion.p className="hero-description" variants={item}>
        {heroData.description}
      </motion.p>
      <HeroActions />
      <motion.ul className="hero-trust" variants={item}>
        {heroData.trust.map((text) => (
          <li key={text}>
            <Check size={13} strokeWidth={1.5} aria-hidden="true" />
            {text}
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
