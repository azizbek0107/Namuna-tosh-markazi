import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import SizeSelector from '../Calculator/SizeSelector.jsx';
import QuantitySelector from '../Calculator/QuantitySelector.jsx';
import PriceSummary from '../Calculator/PriceSummary.jsx';
import { sizeSupportsPieces, getLinearLengthField } from '../../utils/calculatorUtils.js';
import { unitLabel } from '../../utils/priceUtils.js';
import './OrderFormStep.css';

const stepVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
};

/**
 * OrderFormStep — the "editing" step of the modal.
 * Contains: size selector, quantity, price summary, customer info, proceed button.
 */
export default function OrderFormStep({ product, order }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: reduced ? 0 : 0.25 }}
    >
      {/* ── Size selector ─────────────────────────────── */}
      <section className="omf-section">
        <h3 className="omf-section-title">O'lcham va miqdor</h3>
        <SizeSelector
          sizes={product.sizes}
          value={order.selectedSize}
          onChange={order.setSelectedSize}
        />

        {/* Mode selector for non-piece products */}
        {product.priceUnit !== 'piece' && order.modes.length > 1 && (
          <fieldset className="calculator-modes" style={{ marginTop: 14 }}>
            <legend>Miqdorni kiritish usuli</legend>
            {order.modes.map(m => (
              <label key={m}>
                <input
                  type="radio"
                  name="om-quantity-mode"
                  value={m}
                  checked={order.mode === m}
                  onChange={() => order.setMode(m)}
                  disabled={m === 'pieces' && !sizeSupportsPieces(product, order.size)}
                />
                <span>
                  {m === 'pieces'
                    ? 'Dona sonidan hisoblash'
                    : `Bevosita ${unitLabel(product.priceUnit)} kiritish`}
                </span>
              </label>
            ))}
            {!sizeSupportsPieces(product, order.size) && order.modes.includes('pieces') && (
              <p>Dona sonidan hisoblash uchun mahsulot o'lchami kerak.</p>
            )}
            {product.priceUnit === 'linear_m' && (
              <p>
                Hisobdagi uzunlik:{' '}
                {getLinearLengthField(product) === 'widthCm'
                  ? 'tanlangan variantning kengligi'
                  : 'tanlangan variantning uzunligi'}, santimetrda.
              </p>
            )}
          </fieldset>
        )}

        <QuantitySelector
          quantity={order.quantity}
          onChange={order.setQuantity}
          mode={order.mode}
          unit={product.priceUnit}
          error={order.calculation.error}
        />
      </section>

      {/* ── Price summary ─────────────────────────────── */}
      <section className="omf-section">
        <h3 className="omf-section-title">Buyurtma hisobi</h3>
        <PriceSummary product={product} calculation={order.calculation} />
      </section>

      {/* ── Customer info ─────────────────────────────── */}
      <section className="omf-section">
        <h3 className="omf-section-title">Mijoz ma'lumotlari</h3>
        <form className="omf-form" noValidate onSubmit={(e) => { e.preventDefault(); order.goToReview(); }}>
          {/* Name */}
          <label className="omf-label" htmlFor="om-name">
            Ism<span className="omf-required" aria-hidden="true">*</span>
            <input
              id="om-name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              value={order.customer.name}
              onChange={e => order.changeCustomer('name', e.target.value)}
              onBlur={() => order.blurField('name')}
              aria-invalid={Boolean(order.fieldErrors.name)}
              aria-describedby={order.fieldErrors.name ? 'om-name-err' : undefined}
            />
          </label>
          {order.fieldErrors.name && (
            <p id="om-name-err" className="omf-error" role="alert">
              ⚠ {order.fieldErrors.name}
            </p>
          )}

          {/* Phone */}
          <label className="omf-label" htmlFor="om-phone">
            Telefon raqami<span className="omf-required" aria-hidden="true">*</span>
            <input
              id="om-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              maxLength={30}
              placeholder="+998 90 123 45 67"
              value={order.customer.phone}
              onChange={e => order.changeCustomer('phone', e.target.value)}
              onBlur={() => order.blurField('phone')}
              aria-invalid={Boolean(order.fieldErrors.phone)}
              aria-describedby={order.fieldErrors.phone ? 'om-phone-err' : 'om-phone-help'}
            />
          </label>
          {order.fieldErrors.phone
            ? <p id="om-phone-err" className="omf-error" role="alert">⚠ {order.fieldErrors.phone}</p>
            : <p id="om-phone-help" className="omf-help">+998 bilan yoki 9 xonali mahalliy raqamni kiriting.</p>
          }

          {/* Comment */}
          <label className="omf-label" htmlFor="om-comment">
            Qo'shimcha izoh <span style={{ fontWeight: 400, opacity: 0.7 }}>(ixtiyoriy)</span>
            <textarea
              id="om-comment"
              name="comment"
              rows={3}
              maxLength={1500}
              placeholder="Masalan: mahsulotni qayerga yetkazish kerak, o'lcham talablari..."
              value={order.customer.comment}
              onChange={e => order.changeCustomer('comment', e.target.value)}
              aria-invalid={Boolean(order.fieldErrors.comment)}
              aria-describedby={order.fieldErrors.comment ? 'om-comment-err' : undefined}
            />
          </label>
          {order.fieldErrors.comment && (
            <p id="om-comment-err" className="omf-error" role="alert">⚠ {order.fieldErrors.comment}</p>
          )}

          <p className="omf-privacy">
            Ma'lumotlar buyurtma matnini tayyorlash uchun ishlatiladi. Telegramga yuborishni siz tasdiqlaysiz — sayt avtomatik yuborish imkoniyatiga ega emas.
          </p>

          <div className="omf-actions">
            {!order.calculation.valid && order.calculation.error && (
              <p className="omf-calc-error" role="alert">⚠ {order.calculation.error}</p>
            )}
            <button
              type="submit"
              className="omf-submit"
              disabled={!order.calculation.valid}
            >
              Buyurtmani tekshirish
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </motion.div>
  );
}

