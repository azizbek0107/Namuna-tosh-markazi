import './ProductBadge.css';
import { formatMoney, getDiscountConfig } from '../../utils/priceUtils';

export default function ProductBadge({ priceInfo, product }) {
  if (!priceInfo?.hasDiscount) return null;
  const discount = product ? getDiscountConfig(product) : null;
  return <span className="product-discount-badge">−{discount?.type === 'fixed' ? `${formatMoney(discount.value)} / buyurtma` : `${priceInfo.discountPercent}%`}<span className="sr-only"> chegirma</span></span>;
}
