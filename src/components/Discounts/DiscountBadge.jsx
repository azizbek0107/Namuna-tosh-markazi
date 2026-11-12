import { motion, useReducedMotion } from 'motion/react';
import ProductBadge from '../Products/ProductBadge';
import './DiscountBadge.css';

export default function DiscountBadge({ product, priceInfo }) {
  const reduced = useReducedMotion();
  if (!priceInfo.hasDiscount) return null;
  return <motion.span className="discount-badge" initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : .25 }}><ProductBadge product={product} priceInfo={priceInfo} /></motion.span>;
}
