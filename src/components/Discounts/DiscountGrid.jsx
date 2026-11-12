import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import DiscountCard from './DiscountCard';
import './DiscountGrid.css';

export default function DiscountGrid({ products, now }) {
  const reduced = useReducedMotion();
  return <div className="discount-grid"><AnimatePresence mode="popLayout">{products.map((product, index) => <motion.div key={product.id} layout={!reduced} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 13 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .3, delay: reduced ? 0 : Math.min(index * .05, .2) }}><DiscountCard product={product} now={now} priority={index === 0} /></motion.div>)}</AnimatePresence></div>;
}
