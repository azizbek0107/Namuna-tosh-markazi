import ProductCard from '../Products/ProductCard';
import { getDiscountConfig, getPriceInfo } from '../../utils/priceUtils';
import DiscountBadge from './DiscountBadge';
import DiscountCountdown from './DiscountCountdown';
import './DiscountCard.css';

export default function DiscountCard({ product, now = Date.now(), priority = false }) {
  const price = getPriceInfo(product, now);
  if (!price.hasDiscount) return null;
  return <div className="discount-card"><ProductCard product={product} now={now} priority={priority} badge={<DiscountBadge product={product} priceInfo={price} />}><div className="discount-card-bottom"><DiscountCountdown endDate={getDiscountConfig(product).endDate} now={now} /></div></ProductCard></div>;
}
