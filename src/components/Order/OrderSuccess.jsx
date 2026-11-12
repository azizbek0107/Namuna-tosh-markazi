import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ORDER_STEPS, buildOrderMessage } from '../../utils/orderUtils.js';
import OrderSummary from './OrderSummary.jsx';
import TelegramOrderActions from './TelegramOrderActions.jsx';
import './OrderSuccess.css';
import useLanguage from '../../hooks/useLanguage';

const stepVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

/**
 * OrderSuccess — the final step where the user copies and sends via Telegram.
 *
 * IMPORTANT: This component never claims that the order was delivered,
 * received by the server, or confirmed. The user copies the text and
 * sends it manually through Telegram.
 */
export default function OrderSuccess({ product, order }) {
  const { language } = useLanguage();
  const reduced = useReducedMotion();

  const message = buildOrderMessage(product, {
    language,
    size: order.size,
    quantity: order.quantity,
    mode: order.mode,
    customer: order.customer,
    now: order.now,
  });

  return (
    <motion.div
      className="omss-root"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: reduced ? 0 : 0.25 }}
    >
      <p className="omss-intro">
        {order.step === ORDER_STEPS.COPIED
          ? "Buyurtma matni tayyor! Matn nusxalandi. Endi Telegramni ochib, xabarni suhbatga joylashtiring va yuboring."
          : "Buyurtma matni tayyor. Matnni nusxalab, Telegram chatiga joylashtiring va o\u02BBzingiz yuboring."
        }
      </p>

      <OrderSummary product={product} order={order} />

      <TelegramOrderActions
        text={message}
        onCopied={order.markCopied}
      />

      <div className="omss-actions-row">
        <button
          type="button"
          className="omss-back"
          onClick={order.goBackToEditing}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Ma&apos;lumotlarni tahrirlash
        </button>
      </div>
    </motion.div>
  );
}
