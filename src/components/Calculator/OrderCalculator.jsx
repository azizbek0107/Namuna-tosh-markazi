import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import useOrderCalculator from '../../hooks/useOrderCalculator';
import { getLinearLengthField, sizeSupportsPieces, validateCustomer } from '../../utils/calculatorUtils';
import { unitLabel } from '../../utils/priceUtils';
import { buildCalculatorOrderText } from '../../utils/telegramUtils';
import SizeSelector from './SizeSelector';
import QuantitySelector from './QuantitySelector';
import PriceSummary from './PriceSummary';
import OrderForm from './OrderForm';
import TelegramOrderButton from './TelegramOrderButton';
import './OrderCalculator.css';
import useLanguage from '../../hooks/useLanguage';

export default function OrderCalculator({ product }) {
  const { language } = useLanguage();
  const order = useOrderCalculator(product);
  const [customer, setCustomer] = useState({ name: '', phone: '', comment: '' });
  const [errors, setErrors] = useState({});
  const [prepared, setPrepared] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [copyFailedText, setCopyFailedText] = useState('');
  const textRef = useRef(null);
  const reduced = useReducedMotion();
  const text = prepared ? buildCalculatorOrderText(product, { size: order.size, quantity: order.quantity, mode: order.mode, customer, now: order.now, language }) : '';
  useEffect(() => {
    if (prepared) textRef.current?.focus({ preventScroll: true });
  }, [prepared]);
  function changeCustomer(field, value) {
    setCustomer(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
    setPrepared(false);
  }
  function blur(field) {
    setErrors(current => ({ ...current, [field]: validateCustomer(customer)[field] }));
  }
  function prepare(event) {
    event.preventDefault();
    const nextErrors = validateCustomer(customer);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) { document.getElementById(`order-${firstError}`)?.focus(); return; }
    if (order.calculation.valid) setPrepared(true);
  }
  async function copy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text); setCopyFailedText('');
    } catch {
      setCopyFailedText(text); setCopiedText('');
      textRef.current?.focus(); textRef.current?.select();
    }
  }
  return <section id="buyurtma" className="order-calculator" aria-labelledby="order-title" tabIndex={-1}>
    <header className="calculator-heading"><span>BUYURTMA KALKULYATORI</span><h2 id="order-title">Loyihangiz uchun hisoblang.</h2><p>Sotuv birligi: <strong>{unitLabel(product.priceUnit)}</strong></p></header>
    <SizeSelector sizes={product.sizes} value={order.selectedSize} onChange={order.setSelectedSize} />
    {product.priceUnit !== 'piece' && <fieldset className="calculator-modes"><legend>Miqdorni kiritish usuli</legend>{order.modes.map(mode => <label key={mode}><input type="radio" name="quantity-mode" value={mode} checked={order.mode === mode} onChange={() => order.setMode(mode)} disabled={mode === 'pieces' && !sizeSupportsPieces(product, order.size)} /><span>{mode === 'pieces' ? 'Dona sonidan hisoblash' : `Bevosita ${unitLabel(product.priceUnit)} kiritish`}</span></label>)}{!sizeSupportsPieces(product, order.size) && order.modes.includes('pieces') && <p>Dona sonidan hisoblash uchun mahsulot o‘lchami kerak.</p>}{product.priceUnit === 'linear_m' && <p>Hisobdagi uzunlik: {getLinearLengthField(product) === 'widthCm' ? 'tanlangan variantning kengligi' : 'tanlangan variantning uzunligi'}, santimetrda.</p>}</fieldset>}
    <QuantitySelector quantity={order.quantity} onChange={order.setQuantity} mode={order.mode} unit={product.priceUnit} error={order.calculation.error} />
    <PriceSummary product={product} calculation={order.calculation} />
    <OrderForm customer={customer} onChange={changeCustomer} errors={errors} onBlur={blur} onSubmit={prepare} disabled={!order.calculation.valid} />
    {text && <motion.div key="order-preview" className="calculator-order-preview" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .25 }}><label className="order-text-label">Tayyor buyurtma matni<textarea ref={textRef} aria-label="Tayyor buyurtma matni" readOnly rows={14} value={text} spellCheck="false" /></label><div className="order-buttons"><button type="button" className="catalog-copy-button" onClick={copy}>{copiedText === text ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{copiedText === text ? 'Nusxalandi' : 'Buyurtmani nusxalash'}</button><TelegramOrderButton /></div><p className="order-status" role="status">{copyFailedText === text ? 'Avtomatik nusxalash ishlamadi. Yuqoridagi matnni belgilang va qo‘lda nusxalang.' : copiedText === text ? 'Matn nusxalandi. Telegram chatiga joylang va o‘zingiz yuboring.' : 'Buyurtmani nusxalang, Telegramni oching va matnni yuboring.'}</p></motion.div>}
    <p className="calculator-disclaimer">Mavjudlik, aniq o‘lchamlar va yakuniy narx sotuvchi bilan tasdiqlanadi. Sayt buyurtmani avtomatik yubormaydi.</p>
  </section>;
}
