import { motion, useReducedMotion } from 'motion/react';
import { formatMoney, getDiscountConfig } from '../../utils/priceUtils';
import './DiscountSummary.css';

export default function DiscountSummary({ calculation, product }) {
  const reduced = useReducedMotion();
  const discount = getDiscountConfig(product);
  if (!calculation.hasDiscount) return null;
  return <motion.div className="calculator-discount" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .25 }}><span>Chegirma {discount.type === 'percentage' && <b>{Math.min(discount.value, 100)}%</b>}</span><strong>−{formatMoney(calculation.discountAmount)}</strong></motion.div>;
}
