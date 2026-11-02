import { Link } from "react-router-dom";
import { ArrowUpRight, Send } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { orderUrl } from "../Navbar/navigation";
import { revealItem } from "./heroMotion";

export default function HeroActions() {
  const reduced = useReducedMotion();
  return (
    <motion.div className="hero-actions" variants={revealItem(reduced)}>
      <Link className="gold-button hero-primary-cta" to="/products">
        Mahsulotlarni ko‘rish <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      <a
        className="hero-secondary-cta"
        href={orderUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Send size={16} aria-hidden="true" />
        <span>Telegram orqali buyurtma</span>
        <ArrowUpRight size={15} aria-hidden="true" />
        <span className="sr-only"> (yangi oynada ochiladi)</span>
      </a>
    </motion.div>
  );
}
