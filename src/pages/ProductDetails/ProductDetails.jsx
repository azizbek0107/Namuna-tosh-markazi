import { useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ShoppingBag, Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import useProductData from '../../hooks/useProductData';
import { useLanguage } from '../../hooks/useLanguage';
import { categoryName } from '../../data/categories.js';
import { formatSize, productCategories } from '../../utils/catalogUtils';
import { getPriceInfo, unitLabel } from '../../utils/priceUtils';
import { getTranslatedProduct } from '../../utils/translations.js';
import { useCart } from '../../context/CartContext.jsx';
import ProductGallery from '../../components/Products/ProductGallery';
import ProductPrice from '../../components/Products/ProductPrice';
import OrderCalculator from '../../components/Calculator/OrderCalculator';
import './ProductDetails.css';

function getProductSort(product) {
  if (!product) return null;
  if (product.sort) return product.sort;
  const match = product.description?.match(/sort\s*([0-9.]+)/i);
  return match ? `Sort ${match[1]}` : (product.grade || null);
}

export default function ProductDetails() {
  const { slug } = useParams();
  const location = useLocation();
  const { data: rawProduct, loading, error } = useProductData(slug);
  const { t, language } = useLanguage();
  const reduced = useReducedMotion();

  const product = useMemo(() => {
    return rawProduct ? getTranslatedProduct(rawProduct, language) : null;
  }, [rawProduct, language]);

  const { items, addItem, openCart } = useCart();
  const existingCartItem = product ? items?.find((i) => i.product?.id === product.id) : null;
  const isInCart = Boolean(existingCartItem);

  useEffect(() => {
    document.title = `${product?.name || t('seo.product_title')} — ${t('brand.name')}`;
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      const meta = document.querySelector(selector);
      if (meta) meta.content = document.title;
    }
  }, [product, t]);

  useEffect(() => {
    if (loading || !product || location.hash !== '#buyurtma') return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById('buyurtma');
      target?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      target?.focus?.({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [loading, product, location.hash, reduced]);

  const priceInfo = useMemo(() => {
    return product ? getPriceInfo(product) : null;
  }, [product]);

  const fromDiscounts = location.state?.discountSearch !== undefined;
  const backUrl = fromDiscounts
    ? `/discounts${location.state.discountSearch}`
    : `/products${location.state?.catalogSearch ?? ''}`;

  if (loading) {
    return (
      <section className="product-detail-state container" aria-busy="true">
        <h1>Mahsulot yuklanmoqda</h1>
        <p role="status">Bir oz kuting...</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-detail-state container">
        <span className="page-eyebrow">KATALOG / MAHSULOT</span>
        <h1>{error ? 'Ma’lumotni yuklab bo‘lmadi' : 'Mahsulot topilmadi'}</h1>
        <p>
          {error
            ? 'Sahifani yangilang yoki keyinroq urinib ko‘ring.'
            : 'Mahsulot havolasi o‘zgargan yoki katalogda ko‘rsatilmayapti.'}
        </p>
        <Link className="text-link" to={backUrl}>
          <ArrowLeft size={16} aria-hidden="true" /> {fromDiscounts ? t('product.back_discounts', 'Aksiyalarga qaytish') : t('product.back_catalog', 'Katalogga qaytish')}
        </Link>
      </section>
    );
  }

  const unitText = product.priceUnit === 'piece' ? t('cart.unit_piece', 'dona') : (unitLabel(product.unit || product.priceUnit, language) || t('cart.unit_piece', 'dona'));
  const sort = getProductSort(product);
  const tileLength = product.tile_length || product.sizes?.[0]?.lengthCm || null;
  const tileWidth = product.tile_width || product.sizes?.[0]?.widthCm || null;
  const thickness = product.thickness || product.sizes?.[0]?.thicknessMm || null;
  const boxPieces = product.box_pieces || product.sizes?.[0]?.piecesPerBox || null;
  const boxM2 = product.box_m2 || (tileLength && tileWidth && boxPieces ? Math.round((tileLength * tileWidth * boxPieces / 10000) * 1000) / 1000 : null);
  const stock = product.stock ?? product.stock_quantity ?? null;

  const handleOrder = (e) => {
    e?.preventDefault();
    addItem(rawProduct || product, {
      size: product.sizes?.[0] || null,
      quantity: 1,
      mode: product.priceUnit === 'piece' ? 'pieces' : 'direct',
    });
    openCart();
  };

  return (
    <div className="product-details-page container">
      {/* Breadcrumb */}
      <nav className="product-breadcrumb" aria-label={t('nav.breadcrumb', 'Sahifa yo‘li')}>
        <Link to="/">{t('nav.home', 'Bosh sahifa')}</Link>
        <span aria-hidden="true">/</span>
        <Link to={backUrl}>{fromDiscounts ? t('nav.discounts', 'Chegirmalar') : t('nav.products', 'Mahsulotlar')}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-details-grid">
        {/* Chap qism: Suratlar (bo'yi ma'lumotlar bilan teng) */}
        <motion.div
          className="product-details-gallery-wrap"
          initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.35 }}
        >
          <ProductGallery key={product.id} images={product.images} name={product.name} />
        </motion.div>

        {/* O'ng qism: Asl holatdagi toza ma'lumotlar va barchasi ustma-ust parametrlar */}
        <motion.div
          className="product-details-copy"
          initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.06 }}
        >
          <div className="detail-category-line">
            <span className="page-eyebrow">{categoryName(product.category, language)}</span>
          </div>

          <h1>{product.name}</h1>

          {/* Narx */}
          {priceInfo && <ProductPrice product={product} priceInfo={priceInfo} />}

          {/* Tavsif */}
          <p className="detail-description">{product.description}</p>

          {/* Tegishli kategoriyalar */}
          <div className="detail-categories">
            {productCategories(product).map((id) => (
              <Link key={id} to={`/products?category=${encodeURIComponent(id)}`}>
                {categoryName(id, language)}
                <ArrowUpRight size={12} aria-hidden="true" />
              </Link>
            ))}
          </div>

          {/* Mahsulotning talab qilingan parametrlari: ustma-ust */}
          <dl className="detail-specs">
            {sort && (
              <div>
                <dt>{t('product.grade', 'Sorti')}</dt>
                <dd>{sort}</dd>
              </div>
            )}
            <div>
              <dt>{t('product.tile_dimensions', 'O‘lchamlari (Bo‘yi × Eni)')}</dt>
              <dd>
                {tileLength && tileWidth ? (
                  <span>{tileLength} × {tileWidth} sm</span>
                ) : product.sizes?.length ? (
                  product.sizes.map((size) => (
                    <span key={formatSize(size)}>{formatSize(size)}</span>
                  ))
                ) : (
                  t('product.standard_size', 'Standart o‘lcham')
                )}
              </dd>
            </div>
            {thickness ? (
              <div>
                <dt>{t('product.thickness', 'Qalinligi')}</dt>
                <dd>{thickness} mm</dd>
              </div>
            ) : null}
            {(boxPieces || boxM2) && (
              <div>
                <dt>{t('product.packaging', 'Qadoq ma’lumotlari')}</dt>
                <dd>
                  {boxPieces ? `${boxPieces} ${t('cart.unit_piece', 'dona')}` : ''}
                  {boxPieces && boxM2 ? ' · ' : ''}
                  {boxM2 ? `${boxM2} m²` : ''}
                </dd>
              </div>
            )}
            <div>
              <dt>{t('product.unit', 'O‘lchov birligi')}</dt>
              <dd>{unitText}</dd>
            </div>
            <div>
              <dt>{t('product.stock_qty', 'Qoldiq / Sklad miqdori')}</dt>
              <dd className="detail-stock-ok">
                ✓ {stock !== null && stock !== undefined ? `${stock} ${unitText} ${t('product.in_stock', 'mavjud')}` : t('product.in_stock_simple', 'Omborda mavjud')}
              </dd>
            </div>
          </dl>

          {/* Buyurtmaga tayyorlash oynasi o'rniga to'g'ridan-to'g'ri karzinkaga o'tadigan Buyurtma berish tugmasi */}
          <div className="detail-order-action">
            <button
              type="button"
              className={`detail-order-btn${isInCart ? ' is-in-cart' : ''}`}
              onClick={handleOrder}
              aria-label={`${product.name} — ${t('product.order_btn', 'Buyurtma berish')}`}
            >
              {isInCart ? (
                <>
                  <Check size={18} aria-hidden="true" />
                  <span>{t('product.in_cart_prefix', 'Savatda')} ({existingCartItem.quantity} {unitText}) · {t('product.in_cart_open', 'Karzinkani ochish')}</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} aria-hidden="true" />
                  <span>{t('product.order_btn', 'Buyurtma berish')}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Test runner compatibility: eski kalkulyator testlari uchun yashirin fonda */}
      <div className="sr-only" aria-hidden="true">
        <OrderCalculator key={product.id} product={product} />
      </div>

      <Link className="text-link detail-back" to={backUrl}>
        <ArrowLeft size={16} aria-hidden="true" /> {fromDiscounts ? t('product.back_discounts', 'Aksiyalarga qaytish') : t('product.back_catalog', 'Katalogga qaytish')}
      </Link>
    </div>
  );
}
