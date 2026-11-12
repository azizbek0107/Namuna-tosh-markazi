import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import OrderSummary from './OrderSummary.jsx';
import './OrderConfirmation.css';

const stepVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

/**
 * OrderConfirmation — "Buyurtmangizni tekshiring" review step.
 * Shows OrderSummary and lets user go back or proceed to copy.
 */
export default function OrderConfirmation({ product, order }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="omc-root"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: reduced ? 0 : 0.25 }}
    >
      <p className="omc-intro">
        Ma&apos;lumotlarni tekshiring va Telegram orqali yuboring.
        Hamma narsa to&apos;g&apos;rimi? Keyin buyurtma matnini tayyorlang.
      </p>

      <OrderSummary product={product} order={order} />

      <div className="omc-actions">
        <button
          type="button"
          className="omc-back"
          onClick={order.goBackToEditing}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Orqaga
        </button>

        <button
          type="button"
          className="omc-proceed"
          onClick={order.goToReady}
        >
          <Send size={15} aria-hidden="true" />
          Buyurtma matnini tayyorlash
        </button>
      </div>
    </motion.div>
  );
}
