import { formatPrice, getPriceInfo, getDiscountConfig, unitLabel } from '../../utils/priceUtils';
import useLanguage from '../../hooks/useLanguage';

export default function ProductPrice({ product, priceInfo = getPriceInfo(product) }) {
  const { t, language } = useLanguage();
  const fixed = priceInfo.hasDiscount && getDiscountConfig(product).type === 'fixed';

  return (
    <div className="product-price">
      {priceInfo.hasDiscount && (
        <del>{formatPrice(priceInfo.originalPrice, product.priceUnit, language)}</del>
      )}
      <span>{formatPrice(priceInfo.finalPrice, product.priceUnit, language)}</span>
      {fixed && (
        <small>
          {t(
            'discounts.fixed_unit_note',
            `1 ${unitLabel(product.priceUnit)} buyurtma uchun hisob. Summali chegirma butun buyurtmadan bir marta ayriladi.`
          )}
        </small>
      )}
    </div>
  );
}
