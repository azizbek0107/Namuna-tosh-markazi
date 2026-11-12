import { formatMoney, formatPrice, unitLabel, getDiscountConfig } from '../../utils/priceUtils.js';
import { formatSize } from '../../utils/catalogUtils.js';
import { formatMeasure, measurementLabel, normalizeUzPhone } from '../../utils/calculatorUtils.js';
import './OrderSummary.css';

/**
 * OrderSummary — read-only recap of the order (product, sizes, pricing, customer).
 * Shown in the review and success steps.
 */
export default function OrderSummary({ product, order }) {
  const { calculation, size, customer } = order;
  const discount = getDiscountConfig(product);
  const phone = normalizeUzPhone(customer.phone) ?? customer.phone;
  const comment = String(customer.comment ?? '').trim();

  return (
    <div className="oms-root" aria-label="Buyurtma ma'lumotlari">
      <h3 className="oms-title">Buyurtma xulosasi</h3>

      <dl className="oms-dl">
        {/* Product */}
        <div className="oms-row">
          <dt className="oms-dt">Mahsulot</dt>
          <dd className="oms-dd">{product.name}</dd>
        </div>

        {/* Size */}
        <div className="oms-row">
          <dt className="oms-dt">O'lcham</dt>
          <dd className="oms-dd">{formatSize(size)}</dd>
        </div>

        {/* Thickness */}
        {size?.thicknessMm > 0 && (
          <div className="oms-row">
            <dt className="oms-dt">Qalinlik</dt>
            <dd className="oms-dd">{size.thicknessMm} mm</dd>
          </div>
        )}

        {/* Quantity */}
        <div className="oms-row">
          <dt className="oms-dt">Miqdor</dt>
          <dd className="oms-dd">
            {Number.isFinite(calculation.quantity) ? formatMeasure(calculation.quantity) : '—'}{' '}
            {calculation.mode === 'pieces' || product.priceUnit === 'piece'
              ? 'dona'
              : unitLabel(product.priceUnit)}
          </dd>
        </div>

        {/* Derived measurement */}
        {calculation.valid && calculation.measurement !== null && (
          <div className="oms-row">
            <dt className="oms-dt">{measurementLabel(product.priceUnit)}</dt>
            <dd className="oms-dd">
              {formatMeasure(calculation.measurement)} {unitLabel(product.priceUnit)}
            </dd>
          </div>
        )}

        {/* Area per piece */}
        {calculation.mode === 'pieces' && calculation.areaPerPiece !== null && (
          <div className="oms-row">
            <dt className="oms-dt">Bitta plita</dt>
            <dd className="oms-dd">{formatMeasure(calculation.areaPerPiece)} m²</dd>
          </div>
        )}

        <hr className="oms-divider" />

        {/* Unit price */}
        <div className="oms-row">
          <dt className="oms-dt">Birlik narxi</dt>
          <dd className="oms-dd">{formatPrice(product.price, product.priceUnit)}</dd>
        </div>

        {/* Original total */}
        {calculation.subtotal !== null && (
          <div className="oms-row">
            <dt className="oms-dt">Asl summa</dt>
            <dd className="oms-dd">
              {calculation.hasDiscount
                ? <span className="oms-original">{formatMoney(calculation.subtotal)}</span>
                : formatMoney(calculation.subtotal)}
            </dd>
          </div>
        )}

        {/* Discount */}
        {calculation.hasDiscount && (
          <div className="oms-discount-row">
            <dt>
              Chegirma{discount.type === 'percentage' && ` (${Math.min(discount.value, 100)}%)`}
            </dt>
            <dd style={{ margin: 0 }}>−{formatMoney(calculation.discountAmount)}</dd>
          </div>
        )}
      </dl>

      {/* Final total */}
      {calculation.valid && (
        <div className="oms-total-row">
          <span className="oms-total-label">YAKUNIY SUMMA</span>
          {calculation.total !== null
            ? <span className="oms-total-value">{formatMoney(calculation.total)}</span>
            : <span className="oms-no-price">Narx kelishiladi</span>
          }
        </div>
      )}

      {/* Customer info */}
      <div className="oms-customer" aria-label="Mijoz ma'lumotlari">
        <div className="oms-customer-row">
          <span className="oms-customer-label">Ism:</span>
          <span className="oms-customer-value">{String(customer.name ?? '').trim()}</span>
        </div>
        <div className="oms-customer-row">
          <span className="oms-customer-label">Telefon:</span>
          <span className="oms-customer-value">{phone}</span>
        </div>
        {comment && (
          <div className="oms-customer-row">
            <span className="oms-customer-label">Izoh:</span>
            <span className="oms-customer-value">{comment}</span>
          </div>
        )}
      </div>
    </div>
  );
}

