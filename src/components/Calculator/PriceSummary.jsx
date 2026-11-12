import { motion, useReducedMotion } from 'motion/react';
import { formatMoney, formatPrice, unitLabel } from '../../utils/priceUtils';
import { formatSize } from '../../utils/catalogUtils';
import { formatMeasure, measurementLabel } from '../../utils/calculatorUtils';
import DiscountSummary from './DiscountSummary';
import './PriceSummary.css';

export default function PriceSummary({ product, calculation }) {
  const reduced = useReducedMotion();
  return <section className="calculator-summary" aria-labelledby="price-summary-title"><h3 id="price-summary-title">Buyurtma hisobi</h3><dl><div><dt>Mahsulot</dt><dd>{product.name}</dd></div><div><dt>Tanlangan o‘lcham</dt><dd>{formatSize(calculation.size)}</dd></div><div><dt>Miqdor</dt><dd>{Number.isFinite(calculation.quantity) ? formatMeasure(calculation.quantity) : '—'} {calculation.mode === 'pieces' ? 'dona' : unitLabel(product.priceUnit)}</dd></div><div><dt>{measurementLabel(product.priceUnit)}</dt><dd>{calculation.valid ? `${formatMeasure(calculation.measurement)} ${unitLabel(product.priceUnit)}` : '—'}</dd></div>{calculation.mode === 'pieces' && calculation.areaPerPiece !== null && <div><dt>Bitta plita yuzasi</dt><dd>{formatMeasure(calculation.areaPerPiece)} m²</dd></div>}<div><dt>Birlik narxi</dt><dd>{formatPrice(product.price, product.priceUnit)}</dd></div>{calculation.subtotal !== null && <div><dt>Chegirmadan oldingi summa</dt><dd>{calculation.hasDiscount ? <del>{formatMoney(calculation.subtotal)}</del> : formatMoney(calculation.subtotal)}</dd></div>}</dl><DiscountSummary calculation={calculation} product={product} /><div className="calculator-final" role="status" aria-live="polite" aria-atomic="true"><span>Yakuniy summa</span><motion.strong key={`${calculation.total}-${calculation.valid}`} initial={{ opacity: reduced ? 1 : .5 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .25 }}>{!calculation.valid ? 'Miqdorni tekshiring' : formatMoney(calculation.total)}</motion.strong></div>{!calculation.isPriced && <p>Narxni Telegram orqali so‘rang.</p>}</section>;
}
