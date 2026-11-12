import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({ products, now }) {
  const reduced = useReducedMotion();
  return <div className="product-grid"><AnimatePresence mode="popLayout">{products.map((product, index) => <motion.div key={product.id} layout={!reduced} initial={{ opacity: 0, y: reduced ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: reduced ? 1 : .98 }} transition={{ duration: reduced ? 0 : .28, delay: reduced ? 0 : Math.min(index * .055, .22) }}><ProductCard now={now} product={product} priority={index === 0} /></motion.div>)}</AnimatePresence></div>;
}
