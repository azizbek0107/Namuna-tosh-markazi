import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  ArrowRight,
  ArrowLeft,
  Check,
  Truck,
  Store,
  MapPin,
  LocateFixed,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { formatMoney, unitLabel } from '../../utils/priceUtils.js';
import { formatSize } from '../../utils/catalogUtils.js';
import { getTranslatedProduct } from '../../utils/translations.js';
import { erpApi } from '../../services/erpApi.js';
import { TELEGRAM_URL } from '../../config/contactConfig.js';
import useSiteSettings from '../../hooks/useSiteSettings.js';
import './CartDrawer.css';
import CartQuantityInput from './CartQuantityInput';

// Kamida 4 kundan keyingi sanani YYYY-MM-DD formatida hisoblash
function getMinTargetDate(daysAhead = 4) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CartDrawer() {
  const {
    items,
    totalItems,
    subtotalSum,
    totalSum,
    discountSum,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const telegramHandle = settings?.telegramUsername || 'aura_200707';
  const cleanTelegram = telegramHandle.replace(/^@/, '');

  const minDate = getMinTargetDate(4);

  // Rejim: false = Mahsulotlar ro'yxati va tahrirlash; true = Ma'lumot kiritish oynasi
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998 ');
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [geoCoords, setGeoCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [targetDate, setTargetDate] = useState(() => getMinTargetDate(4));

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isCartOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (isCheckoutOpen) {
          setIsCheckoutOpen(false); // Agar ma'lumotlar oynasida bo'lsa, oldin uni yopamiz
        } else {
          closeCart();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCartOpen, isCheckoutOpen, closeCart]);

  // Lock body scroll when open and reset states when reopening
  useEffect(() => {
    if (isCartOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    } else {
      setOrderPlaced(false);
      setIsCheckoutOpen(false);
    }
  }, [isCartOpen]);

  // Handle GPS location detection
  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocError('cart.no_gps');
      return;
    }
    setLocating(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeoCoords({ lat, lng });
        if (!locationAddress.trim()) {
          setLocationAddress(`GPS lokatsiya: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocError('cart.gps_failed');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!isCartOpen) return null;

  const handleCheckout = (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setFormError('cart.name_required');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setFormError('cart.phone_required');
      return;
    }
    if (needsDelivery && !locationAddress.trim() && !geoCoords) {
      setFormError('cart.address_required');
      return;
    }
    if (!targetDate || targetDate < minDate) {
      setFormError('cart.date_invalid');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const formattedDate = targetDate.split('-').reverse().join('.');
    const dateLabel = needsDelivery ? 'Yetkazib berish sanasi' : 'Olib ketish sanasi';

    // Build comprehensive Telegram message for all cart items
    let message = `🛒 YANGI BUYURTMA — ${t('brand.title')}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 Mijoz: ${customerName.trim()}\n`;
    message += `📞 Telefon: ${customerPhone.trim()}\n`;
    message += `📅 ${dateLabel}: ${formattedDate}\n`;

    // Dostavka / Lokatsiya ma'lumotlari
    if (needsDelivery) {
      message += `🚚 Xizmat turi: Yetkazib berish (Dostavka)\n`;
      if (geoCoords) {
        message += `📍 Karta lokatsiyasi: https://maps.google.com/?q=${geoCoords.lat},${geoCoords.lng}\n`;
      }
      if (locationAddress.trim()) {
        message += `📍 Yetkazib berish manzili: ${locationAddress.trim()}\n`;
      }
    } else {
      message += `🚚 Xizmat turi: Olib ketish (Samovivoz)\n`;
    }

    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📦 BUYURTMA QILINGAN MAHSULOTLAR (${items.length} ta):\n\n`;

    items.forEach((item, idx) => {
      const p = item.product;
      const sizeStr = item.size ? `${item.size.lengthCm}×${item.size.widthCm} sm` : 'Standart';
      const unit = item.mode === 'pieces' ? 'dona' : unitLabel(p.priceUnit, language);
      const itemTotal = item.calculation?.total ?? item.calculation?.subtotal;
      const totalStr = itemTotal ? formatMoney(itemTotal) : t('product.negotiable');

      message += `${idx + 1}. ${p.name}\n`;
      message += `   • O‘lchami: ${sizeStr}\n`;
      message += `   • Miqdori: ${item.quantity} ${unit}`;
      if (item.calculation?.measurement && item.mode === 'pieces' && p.priceUnit === 'm2') {
        message += ` (≈ ${item.calculation.measurement} m²)`;
      }
      message += `\n`;
      message += `   • Narxi: ${totalStr}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    if (discountSum > 0) {
      message += `💰 Oraliq summa: ${formatMoney(subtotalSum)}\n`;
      message += `🎁 Chegirma: -${formatMoney(discountSum)}\n`;
    }
    message += `💳 JAMI TO‘LOV: ${totalSum > 0 ? formatMoney(totalSum) : t('product.negotiable')}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Sana: ${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}\n`;
    message += `Sayt orqali yuborildi.`;

    const encoded = encodeURIComponent(message);
    const targetUrl = `https://t.me/${cleanTelegram}?text=${encoded}`;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // Stonex ERP tizimiga savdo / buyurtmani avtomatik jo'natish
    try {
      erpApi.createSale({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        items: items.map(item => ({
          product_id: Number(item.product?.erpId || item.product?.id) || 1,
          quantity: Number(item.quantity) || 1,
          price: Number(item.product?.price) || 0,
          unit: item.mode === 'pieces' ? 'dona' : (item.product?.unit === 'dona' ? 'dona' : 'base')
        })),
        paid_amount: 0,
        status: 'pending',
        note: `Web sayt buyurtmasi. Sana: ${formattedDate}. ${needsDelivery ? 'Dostavka: ' + (locationAddress || '') : 'Samovivoz'}`
      }).catch(() => {});
    } catch {}

    // Foydalanuvchi buyurtmani tasdiqlagach, savatni to'liq bo'shatamiz
    clearCart();
    setLocationAddress('');
    setGeoCoords(null);
    setNeedsDelivery(false);
    setTargetDate(getMinTargetDate(4));
    setIsCheckoutOpen(false);
    setOrderPlaced(true);
    setIsSubmitting(false);
  };

  return createPortal(
    <div className="cart-backdrop" onClick={closeCart} role="presentation">
      <motion.aside
        ref={drawerRef}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.title', 'Xaridlar savatchasi')}
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* Top Header */}
        <div className="cart-header">
          {isCheckoutOpen ? (
            <div className="cart-header-title">
              <button
                type="button"
                className="cart-back-btn"
                onClick={() => setIsCheckoutOpen(false)}
                aria-label={t('cart.back_to_items', 'Savatdagi mahsulotlarga qaytish')}
              >
                <ArrowLeft size={18} aria-hidden="true" />
                <span>{t('cart.back_to_items', 'Savatga qaytish')}</span>
              </button>
            </div>
          ) : (
            <div className="cart-header-title">
              <ShoppingBag size={20} className="cart-header-icon" aria-hidden="true" />
              <h2>{t('cart.title', 'Savatcha')}</h2>
              <span className="cart-count-badge">{totalItems}</span>
            </div>
          )}

          <div className="cart-header-actions">
            {!isCheckoutOpen && !orderPlaced && items.length > 0 && (
              <button
                type="button"
                className="cart-clear-btn"
                onClick={clearCart}
                aria-label={t('cart.clear', 'Savatchani tozalash')}
                title={t('cart.clear', 'Savatchani tozalash')}
              >
                <Trash2 size={15} aria-hidden="true" />
                <span>{t('cart.clear', 'Tozalash')}</span>
              </button>
            )}
            <button
              type="button"
              className="cart-close-btn"
              onClick={closeCart}
              aria-label={t('cart.close', 'Savatchani yopish')}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="cart-body">
          {orderPlaced ? (
            /* Buyurtma tasdiqlangandan keyingi muvaffaqiyatli holat */
            <div className="cart-success-state">
              <div className="cart-success-icon-wrap">
                <Check size={40} aria-hidden="true" />
              </div>
              <h3>{t('cart.success_title', 'Buyurtmangiz yuborildi!')}</h3>
              <p>
                {t('cart.success_desc', 'Buyurtma matni Telegram orqali menejerimizga jo‘natildi. Savatchangiz muvaffaqiyatli bo‘shatildi.')}
              </p>
              <button
                type="button"
                className="cart-browse-btn"
                onClick={() => {
                  setOrderPlaced(false);
                  closeCart();
                }}
              >
                {t('cart.success_close', 'Tushunarli, yopish')}
              </button>
            </div>
          ) : isCheckoutOpen ? (
            /* ── MA'LUMOTLAR KIRGIZILADIGAN OYNA (CHECKOUT VIEW) ── */
            <div className="cart-checkout-view">
              <form id="cart-checkout-form" onSubmit={handleCheckout} className="cart-checkout-form">
                {formError && (
                  <div className="cart-form-error" role="alert">
                    {t(formError)}
                  </div>
                )}

                <div className="cart-inputs-row">
                  <input
                    type="text"
                    placeholder={`${t('cart.customer_name', 'Ismingiz')} *`}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="cart-input"
                    required
                  />
                  <input
                    type="tel"
                    placeholder={`${t('cart.customer_phone', 'Telefon raqam')} *`}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="cart-input"
                    required
                  />
                </div>

                {/* ── DOSTAVKA XIZMATI VA LOKATSIYA BELGISI / KARTA ── */}
                <div className="cart-delivery-section">
                  <div className="cart-delivery-toggle">
                    <button
                      type="button"
                      className={`cart-delivery-btn${!needsDelivery ? ' is-active' : ''}`}
                      onClick={() => setNeedsDelivery(false)}
                    >
                      <Store size={15} aria-hidden="true" />
                      <span>{t('cart.pickup', 'Olib ketish')}</span>
                    </button>
                    <button
                      type="button"
                      className={`cart-delivery-btn${needsDelivery ? ' is-active' : ''}`}
                      onClick={() => setNeedsDelivery(true)}
                    >
                      <Truck size={15} aria-hidden="true" />
                      <span>{t('cart.delivery', 'Dostavka xizmati')}</span>
                    </button>
                  </div>

                  {needsDelivery && (
                    <div className="cart-location-box">
                      <div className="cart-location-header">
                        <span className="cart-location-title">
                          <MapPin size={15} className="cart-pin-icon" aria-hidden="true" />
                          {t('cart.delivery_address', 'Yetkazib berish manzili')}:
                        </span>
                        <button
                          type="button"
                          className="cart-gps-btn"
                          onClick={handleGetLocation}
                          disabled={locating}
                          title={t('cart.my_location', 'Joriy geolokatsiyangizni aniqlash')}
                        >
                          <LocateFixed size={14} className={locating ? 'spin-icon' : ''} aria-hidden="true" />
                          <span>{locating ? t('cart.locating') : t('cart.my_location', 'Mening lokatsiyam')}</span>
                        </button>
                      </div>

                      <div className="cart-location-input-wrap">
                        <MapPin size={16} className="cart-input-pin" aria-hidden="true" />
                        <input
                          type="text"
                          placeholder={`${t('cart.address_placeholder', 'Manzil yoki karta koordinatasini kiriting')} *`}
                          value={locationAddress}
                          onChange={(e) => setLocationAddress(e.target.value)}
                          className="cart-input cart-location-input"
                          required={needsDelivery}
                        />
                      </div>

                      {geoCoords && (
                        <div className="cart-coords-success">
                          <Check size={13} aria-hidden="true" />
                          <span>{t('cart.location_attached')}</span>
                          <a
                            href={`https://maps.google.com/?q=${geoCoords.lat},${geoCoords.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cart-map-view-link"
                          >
                            {t('cart.view_map')}
                          </a>
                        </div>
                      )}

                      {locError && (
                        <p className="cart-location-error" role="alert">{t(locError)}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* ── OLIB KETISH YOKI YETKAZIB BERILISHI KERAK BO'LGAN SANA (MINIMUM 4 KUN) ── */}
                <div className="cart-date-section">
                  <label htmlFor="cart-target-date" className="cart-date-label">
                    <Calendar size={15} className="cart-date-icon" aria-hidden="true" />
                    <span>
                      {needsDelivery ? `${t('cart.delivery_date', 'Yetkazib berilishi kerak bo‘lgan sana')}:` : `${t('cart.pickup_date', 'Olib ketish sanasi')}:`}
                    </span>
                  </label>
                  <div className="cart-date-input-wrap">
                    <input
                      id="cart-target-date"
                      type="date"
                      min={minDate}
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="cart-input cart-date-input"
                      required
                    />
                  </div>
                  <p className="cart-date-note">
                    {t('cart.lead_time')}
                  </p>
                </div>
              </form>
            </div>
          ) : items.length === 0 ? (
            /* Bo'sh savat */
            <div className="cart-empty-state">
              <div className="cart-empty-icon-wrap">
                <ShoppingBag size={48} strokeWidth={1.2} />
              </div>
              <h3>{t('cart.empty', 'Savatchangiz hozircha bo‘sh')}</h3>
              <p>
                {t('cart.empty_desc', 'Katalogdan kerakli kerama granit yoki tosh mahsulotlarini tanlang va savatchaga qo‘shing.')}
              </p>
              <Link
                to="/products"
                className="cart-browse-btn"
                onClick={closeCart}
              >
                <span>{t('cart.view_catalog', 'Katalogga o‘tish')}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            /* ── MAHSULOTLAR RO'YXATI VA TAHRIRLASH OYNASI (ASOSIY OCHIQ TURADIGAN QISM) ── */
            <div className="cart-items-list" role="list">
              {items.map((item) => {
                const p = getTranslatedProduct(item.product, language);
                const firstImg = p.images?.[0];
                const imgSrc = typeof firstImg === 'string'
                  ? firstImg
                  : (firstImg?.src || firstImg?.url || '/images/products/placeholder.jpg');

                const unit = item.mode === 'pieces' ? t('cart.unit_piece', 'dona') : (unitLabel(p.priceUnit, language) || t('cart.unit_piece', 'dona'));
                const itemTotal = item.calculation?.total ?? item.calculation?.subtotal;
                const measurementText = item.calculation?.measurement && item.mode === 'pieces' && p.priceUnit === 'm2'
                  ? ` (≈ ${item.calculation.measurement} m²)`
                  : '';

                return (
                  <article key={item.id} className="cart-item" role="listitem">
                    {/* Thumbnail */}
                    <div className="cart-item-image">
                      <img src={imgSrc} alt={p.name} loading="lazy" />
                    </div>

                    {/* Details */}
                    <div className="cart-item-info">
                      <div className="cart-item-top">
                        <h4 className="cart-item-name">
                          <Link to={`/products/${p.slug}`} onClick={closeCart}>
                            {p.name}
                          </Link>
                        </h4>
                        <button
                          type="button"
                          className="cart-item-remove"
                          onClick={() => removeItem(item.id)}
                          aria-label={`${p.name} mahsulotini savatchadan o‘chirish`}
                          title="O‘chirish"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      {/* Size */}
                      <p className="cart-item-size">
                        {item.size ? formatSize(item.size) : t('product.standard_size', 'Standart o‘lcham')}
                      </p>

                      {/* Unit price */}
                      <div className="cart-item-unit-price">
                        {p.price
                          ? `${formatMoney(p.price)} / ${unitLabel(p.priceUnit, language)}`
                          : t('product.negotiable')}
                      </div>

                      {/* Yandex-style Quantity Control & Subtotal */}
                      <div className="cart-item-bottom">
                        <div className="yandex-stepper" aria-label="Mahsulot miqdorini o‘zgartirish">
                          <button
                            type="button"
                            className="yandex-step-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Bitta kamaytirish"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="yandex-qty-display">
                            <CartQuantityInput item={item} name={p.name} onChange={updateQuantity} />
                            <span>{unit}{measurementText}</span>
                          </span>
                          <button
                            type="button"
                            className="yandex-step-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Bitta oshirish"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="cart-item-price-sum">
                          <strong>{itemTotal ? formatMoney(itemTotal) : t('product.negotiable')}</strong>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Checkout Sheet */}
        {!orderPlaced && items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-box">
              <div className="cart-summary-total">
                <span>{t('cart.total', 'Jami to‘lov')}:</span>
                <strong>{totalSum > 0 ? formatMoney(totalSum) : t('product.negotiable')}</strong>
              </div>
            </div>
            {isCheckoutOpen ? (
              /* Ma'lumot kiritish holatidagi pastki tugmalar: Yopish (savatga qaytish) va Telegramga tasdiqlash */
              <div className="cart-checkout-actions">
                <button
                  type="button"
                  className="cart-cancel-btn"
                  onClick={() => setIsCheckoutOpen(false)}
                  aria-label="Ma'lumotlar oynasini yopish va savatga qaytish"
                >
                  <X size={16} aria-hidden="true" />
                  <span>{t('cart.close', 'Yopish')}</span>
                </button>
                <button
                  type="submit"
                  form="cart-checkout-form"
                  className="yandex-checkout-btn"
                  disabled={isSubmitting}
                >
                  <Send size={18} aria-hidden="true" />
                  <span>{isSubmitting ? t('cart.sending', 'Yuborilmoqda...') : t('cart.telegram_confirm', 'Buyurtmani tasdiqlash (Telegram)')}</span>
                </button>
              </div>
            ) : (
              /* Asosiy savatcha holatidagi pastki tugma: Faqat "Buyurtma berish" tugmasi turadi! */
              <div className="cart-main-actions">
                <button
                  type="button"
                  className="yandex-checkout-btn yandex-primary-btn"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <span>{t('product.order_btn', 'Buyurtma berish')}</span>
                  <div className="yandex-btn-right">
                    <ArrowRight size={18} aria-hidden="true" />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.aside>
    </div>,
    document.body
  );
}
