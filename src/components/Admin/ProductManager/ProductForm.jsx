import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import ProductImageUploader from './ProductImageUploader';
import './ProductForm.css';

const DEFAULT_CATEGORIES = [
  { id: 'kerama-granit', slug: 'kerama-granit', name: 'Keramogranit' },
  { id: 'granit', slug: 'granit', name: 'Granit' },
  { id: 'marmar', slug: 'marmar', name: 'Marmar' },
  { id: 'xizmatlar', slug: 'xizmatlar', name: 'Xizmatlar' },
  { id: 'kafel', slug: 'kafel', name: 'Kafel' },
  { id: 'tayyor-mahsulot', slug: 'tayyor-mahsulot', name: 'Tayyor mahsulot' },
  { id: 'qoshimcha', slug: 'qoshimcha', name: 'Qo‘shimcha' },
  { id: 'xomashyo', slug: 'xomashyo', name: 'Xomashyo' },
];

export default function ProductForm({
  product = null,
  categories = [],
  isOpen = false,
  onClose,
  onSubmit,
  isSubmitting = false
}) {
  const mergedCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    category: 'kerama-granit',
    unit: 'm2',
    price: '',
    cost_price: '',
    tile_length: '',
    tile_width: '',
    thickness: '',
    box_pieces: '',
    box_m2: '',
    stock: '',
    description: '',
    isVisible: true,
    images: [],
    autoBoxM2: true
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (product) {
      const length = product.tile_length ?? product.sizes?.[0]?.lengthCm ?? '';
      const width = product.tile_width ?? product.sizes?.[0]?.widthCm ?? '';
      const thickness = product.thickness ?? product.sizes?.[0]?.thicknessMm ?? '';
      const boxPieces = product.box_pieces ?? product.sizes?.[0]?.piecesPerBox ?? '';
      const boxM2 = product.box_m2 ?? (length && width && boxPieces ? Math.round((Number(length) * Number(width) * Number(boxPieces) / 10000) * 1000) / 1000 : '');
      const unit = product.unit || product.priceUnit || 'm2';
      const cost = product.cost_price ?? product.costPrice ?? '';
      const stock = product.stock ?? product.stock_quantity ?? '';

      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        categoryId: product.categoryId || product.category_id || '',
        category: product.category || product.category_name || 'kerama-granit',
        unit,
        price: product.price ?? '',
        cost_price: cost,
        tile_length: length !== null && length !== undefined ? String(length) : '',
        tile_width: width !== null && width !== undefined ? String(width) : '',
        thickness: thickness !== null && thickness !== undefined ? String(thickness) : '',
        box_pieces: boxPieces !== null && boxPieces !== undefined ? String(boxPieces) : '',
        box_m2: boxM2 !== null && boxM2 !== undefined ? String(boxM2) : '',
        stock: stock !== null && stock !== undefined ? String(stock) : '',
        description: product.description || '',
        isVisible: product.isVisible ?? product.is_active ?? true,
        images: Array.isArray(product.images)
          ? [...product.images]
          : product.image
          ? [{ id: 'img-0', url: product.image, isPrimary: true }]
          : [],
        autoBoxM2: false
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        categoryId: mergedCategories[0]?.id || 'kerama-granit',
        category: mergedCategories[0]?.slug || mergedCategories[0]?.name || 'kerama-granit',
        unit: 'm2',
        price: '',
        cost_price: '',
        tile_length: '',
        tile_width: '',
        thickness: '',
        box_pieces: '',
        box_m2: '',
        stock: '',
        description: '',
        isVisible: true,
        images: [],
        autoBoxM2: true
      });
    }
    setValidationError('');
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const val = e.target.value;
    const updates = { name: val };
    // Auto-generate slug if product is new or slug is empty
    if (!product) {
      updates.slug = val
        .toLowerCase()
        .trim()
        .replace(/['`ʻʼ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleCategorySelect = (e) => {
    const selectedId = e.target.value;
    const cat = mergedCategories.find((c) => String(c.id) === selectedId || c.slug === selectedId);
    setFormData((prev) => ({
      ...prev,
      categoryId: selectedId,
      category: cat?.slug || cat?.id || selectedId
    }));
  };

  const handleDimensionChange = (field, val) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      const l = parseFloat(field === 'tile_length' ? val : next.tile_length);
      const w = parseFloat(field === 'tile_width' ? val : next.tile_width);
      const p = parseFloat(field === 'box_pieces' ? val : next.box_pieces);

      if (l > 0 && w > 0 && p > 0 && (!next.box_m2 || prev.autoBoxM2)) {
        next.box_m2 = String(Math.round(((l * w * p) / 10000) * 1000) / 1000);
        next.autoBoxM2 = true;
      }
      return next;
    });
  };

  const handleBoxM2Change = (e) => {
    setFormData((prev) => ({
      ...prev,
      box_m2: e.target.value,
      autoBoxM2: false
    }));
  };

  const calculateBoxM2Manual = () => {
    const l = parseFloat(formData.tile_length);
    const w = parseFloat(formData.tile_width);
    const p = parseFloat(formData.box_pieces);
    if (l > 0 && w > 0 && p > 0) {
      setFormData((prev) => ({
        ...prev,
        box_m2: String(Math.round(((l * w * p) / 10000) * 1000) / 1000),
        autoBoxM2: true
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Mahsulot nomi kiritilishi shart.');
      return;
    }
    if (!formData.slug.trim()) {
      setValidationError('Mahsulot URL identifikatori (slug) kiritilishi shart.');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setValidationError('To‘g‘ri sotuv narxi kiritilishi shart.');
      return;
    }

    const lengthNum = formData.tile_length ? parseFloat(formData.tile_length) : null;
    const widthNum = formData.tile_width ? parseFloat(formData.tile_width) : null;
    const thicknessNum = formData.thickness ? parseFloat(formData.thickness) : null;
    const boxPiecesNum = formData.box_pieces ? parseInt(formData.box_pieces, 10) : null;
    const boxM2Num = formData.box_m2 ? parseFloat(formData.box_m2) : (lengthNum && widthNum && boxPiecesNum ? Math.round(((lengthNum * widthNum * boxPiecesNum) / 10000) * 1000) / 1000 : null);
    const costPriceNum = formData.cost_price !== '' && formData.cost_price !== null ? parseFloat(formData.cost_price) : null;
    const stockNum = formData.stock !== '' && formData.stock !== null ? parseFloat(formData.stock) : null;

    const availableSizes = (lengthNum && widthNum) ? [{
      lengthCm: lengthNum,
      widthCm: widthNum,
      thicknessMm: thicknessNum || 0,
      piecesPerBox: boxPiecesNum || 1
    }] : [];

    const payload = {
      ...formData,
      price: priceNum,
      priceUnit: formData.unit,
      unit: formData.unit,
      cost_price: costPriceNum,
      costPrice: costPriceNum,
      tile_length: lengthNum,
      tile_width: widthNum,
      thickness: thicknessNum,
      box_pieces: boxPiecesNum,
      box_m2: boxM2Num,
      stock: stockNum,
      sizes: availableSizes,
      availableSizes: availableSizes,
      image:
        formData.images.find((img) => img.isPrimary)?.url ||
        formData.images[0]?.url ||
        formData.images[0]?.src ||
        ''
    };

    onSubmit(payload);
  };

  return (
    <div className="product-form-modal-overlay" onClick={onClose}>
      <div
        className="product-form-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-heading"
      >
        <div className="product-form-header">
          <h2 id="product-form-heading" className="product-form-title">
            {product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo‘shish'}
          </h2>
          <button
            type="button"
            className="product-form-close-btn"
            onClick={onClose}
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="product-form-body">
            {validationError && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 107, 107, 0.12)',
                  border: '1px solid rgba(255, 107, 107, 0.4)',
                  borderRadius: 2,
                  color: '#ff6b6b',
                  fontSize: 13
                }}
              >
                {validationError}
              </div>
            )}

            {/* 1. Nomi va Identifikatori (Slug) */}
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">
                  Mahsulot nomi (name) <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="form-input"
                  placeholder="Masalan: Keramogranit Calacatta Gold 60x120"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Identifikator (slug) <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="form-input"
                  placeholder="keramogranit-calacatta-gold-60x120"
                />
              </div>
            </div>

            {/* 2. Kategoriya va O'lchov birligi */}
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Kategoriya (category)</label>
                <select
                  value={formData.categoryId || formData.category}
                  onChange={handleCategorySelect}
                  className="form-select"
                >
                  {mergedCategories.map((c) => (
                    <option key={c.id || c.slug} value={c.id || c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">
                  O‘lchov birligi (unit) <span className="req">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                  className="form-select"
                >
                  <option value="m2">m² (Kvadrat metr)</option>
                  <option value="piece">dona</option>
                  <option value="linear_m">m (Metr / Pogon metr)</option>
                  <option value="kg">kg (Kilogramm)</option>
                </select>
              </div>
            </div>

            {/* 3. Sotuv narxi va Tannarxi */}
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">
                  Sotuv narxi (price, so‘m) <span className="req">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="form-input"
                  placeholder="Masalan: 180000"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Tannarxi (cost_price, so‘m) <span style={{ opacity: 0.6, textTransform: 'none', fontWeight: 400 }}>(ixtiyoriy)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.cost_price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cost_price: e.target.value }))}
                  className="form-input"
                  placeholder="Masalan: 145000"
                />
              </div>
            </div>

            {/* 4. O'lchamlari: Bo'yi (sm), Eni (sm), Qalinligi (mm) */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-primary)', display: 'block', marginBottom: 12 }}>
                O‘lchamlari (Dimensions)
              </span>
              <div className="form-grid-3">
                <div className="form-field">
                  <label className="form-label">Bo‘yi, sm (tile_length)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.tile_length}
                    onChange={(e) => handleDimensionChange('tile_length', e.target.value)}
                    className="form-input"
                    placeholder="Masalan: 120"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Eni, sm (tile_width)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.tile_width}
                    onChange={(e) => handleDimensionChange('tile_width', e.target.value)}
                    className="form-input"
                    placeholder="Masalan: 60"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Qalinligi, mm (thickness)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.thickness}
                    onChange={(e) => setFormData((prev) => ({ ...prev, thickness: e.target.value }))}
                    className="form-input"
                    placeholder="Masalan: 9"
                  />
                </div>
              </div>
            </div>

            {/* 5. Qadoq ma'lumotlari: karobkadagi dona soni, karobkadagi m² */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-primary)', display: 'block', marginBottom: 12 }}>
                Qadoq ma’lumotlari (Packaging)
              </span>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Karobkadagi dona soni (box_pieces)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.box_pieces}
                    onChange={(e) => handleDimensionChange('box_pieces', e.target.value)}
                    className="form-input"
                    placeholder="Masalan: 2"
                  />
                </div>

                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Karobkadagi m² (box_m2)</label>
                    {formData.tile_length && formData.tile_width && formData.box_pieces && (
                      <button
                        type="button"
                        onClick={calculateBoxM2Manual}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--gold-primary)',
                          fontSize: 11,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: 0
                        }}
                      >
                        <Sparkles size={11} /> Qayta hisoblash
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.box_m2}
                    onChange={handleBoxM2Change}
                    className="form-input"
                    placeholder="Masalan: 1.44"
                  />
                </div>
              </div>
            </div>

            {/* 6. Qoldiq / Sklad miqdori */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">
                    Qoldiq / Sklad miqdori (stock) <span style={{ opacity: 0.6, textTransform: 'none', fontWeight: 400 }}>(agar bo‘lsa)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.stock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                    className="form-input"
                    placeholder={`Masalan: 1250 (${formData.unit})`}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Tavsif (ixtiyoriy)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="form-input"
                    placeholder="Qo‘shimcha ma’lumot yoki xususiyatlar..."
                  />
                </div>
              </div>
            </div>

            {/* 7. Rasmlar va Faollik holati */}
            <ProductImageUploader
              images={formData.images}
              onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
            />

            <label className="form-checkbox-row">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData((prev) => ({ ...prev, isVisible: e.target.checked }))}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                Saytda ko‘rsatish (Faol holat)
              </span>
            </label>
          </div>

          <div className="product-form-footer">
            <button
              type="button"
              className="form-cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="form-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <span>{product ? 'O‘zgarishlarni saqlash' : 'Mahsulotni yaratish'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
