import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import './CartTrigger.css';
import useLanguage from '../../hooks/useLanguage';

export default function CartTrigger() {
  const { totalItems, openCart } = useCart();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="icon-button cart-trigger-btn"
      onClick={openCart}
      aria-label={`${t('cart.title')}${totalItems > 0 ? ` (${totalItems})` : ''}`}
      title={`${t('cart.title')}${totalItems > 0 ? ` (${totalItems})` : ''}`}
    >
      <ShoppingCart size={20} strokeWidth={1.5} aria-hidden="true" />
      {totalItems > 0 && (
        <span className="cart-trigger-badge" aria-hidden="true">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}

