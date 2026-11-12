import { Link } from "react-router-dom";
import { ArrowUpRight, Layers3, MoveUpRight, Ruler } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { heroStats } from "../../data/heroData";
import useLanguage from "../../hooks/useLanguage";
import "./HeroStats.css";

const icons = { layers: Layers3, stairs: MoveUpRight, ruler: Ruler };

export default function HeroStats() {
  const reduced = useReducedMotion();
  const { t } = useLanguage();

  return (
    <div className="hero-stats" aria-label="Mahsulot va xizmat yo‘nalishlari">
      {heroStats.map((stat, index) => {
        const Icon = icons[stat.icon];
        const title = t(`hero.stat_${index + 1}_title`, stat.title);
        const desc = t(`hero.stat_${index + 1}_desc`, stat.description);

        return (
          <motion.div
            key={stat.id}
            className="hero-stat"
            initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? 0 : 0.5,
              delay: reduced ? 0 : 0.55 + index * 0.08,
            }}
          >
            <Link to={stat.to}>
              <span className="hero-stat-icon">
                <Icon size={22} strokeWidth={1.2} aria-hidden="true" />
              </span>
              <div>
                <h2>{title}</h2>
                <p>{desc}</p>
              </div>
              <ArrowUpRight
                className="hero-stat-arrow"
                size={16}
                aria-hidden="true"
              />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
