import { motion, useReducedMotion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { heroData } from "../../data/heroData";
import HeroActions from "./HeroActions";
import { revealItem } from "./heroMotion";
import useLanguage from "../../hooks/useLanguage";

export default function HeroContent() {
  const reduced = useReducedMotion();
  const { t } = useLanguage();
  const item = revealItem(reduced);
  const [brand, ...title] = heroData.title.split(" ");
  const badgeText = t('hero.badge', heroData.badge);
  const subtitleText = t('hero.subtitle', heroData.subtitle);
  const descText = t('hero.description', heroData.description);
  const trustItems = [
    t('hero.trust_1', heroData.trust[0]),
    t('hero.trust_2', heroData.trust[1]),
  ];

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
        <span>{badgeText}</span>
      </motion.div>
      <motion.h1 id="hero-title" className="hero-title" variants={item}>
        <span>{t('hero.title_brand', brand)}</span> <span>{t('hero.title_rest', title.join(' '))}</span>
      </motion.h1>
      <motion.p className="hero-subtitle" variants={item}>
        {subtitleText}
      </motion.p>
      <motion.p className="hero-description" variants={item}>
        {descText}
      </motion.p>
      <HeroActions />
      <motion.ul className="hero-trust" variants={item}>
        {trustItems.map((text) => (
          <li key={text}>
            <Check size={13} strokeWidth={1.5} aria-hidden="true" />
            {text}
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
