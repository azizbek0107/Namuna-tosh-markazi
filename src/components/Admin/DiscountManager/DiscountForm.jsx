import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import './DiscountForm.css';

export default function DiscountForm({
  discount = null,
  products = [],
  isOpen = false,
  onClose,
  onSubmit,
  isSubmitting = false
}) {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'percentage',
    value: 10,
    startDate: '',
    endDate: '',
    isActive: true
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (discount) {
      setFormData({
        productId: discount.productId || discount.product_id || '',
        type: discount.type || discount.discount_type || 'percentage',
        value: discount.value ?? discount.discount_value ?? 10,
        startDate: (discount.startDate || discount.starts_at || '').slice(0, 10),
        endDate: (discount.endDate || discount.ends_at || '').slice(0, 10),
        isActive: Boolean(discount.isActive ?? discount.is_active ?? true)
      });
    } else {
      setFormData({
        productId: products[0]?.id || '',
        type: 'percentage',
        value: 10,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        isActive: true
      });
    }
    setError('');
  }, [discount, isOpen, products]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(formData.value);
    if (isNaN(val) || val <= 0) {
      setError('Chegirma miqdori 0 dan katta bo‘lishi lozim.');
      return;
    }
    if (formData.type === 'percentage' && val > 100) {
      setError('Foizli chegirma 100% dan oshmasligi kerak.');
      return;
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      setError('Tugash sanasi boshlanish sanasidan keyin bo‘lishi shart.');
      return;
    }

    const selectedProd = products.find((p) => String(p.id) === String(formData.productId));

    onSubmit({
      ...formData,
      value: val,
      productName: selectedProd?.name || 'Barcha mahsulotlar'
    });
  };

  return (
    <div className="discount-form-modal-overlay" onClick={onClose}>
      <div
        className="discount-form-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-form-heading"
      >
        <div className="discount-form-header">
          <h2 id="discount-form-heading" style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {discount ? 'Chegirmani tahrirlash' : 'Yangi chegirma qo‘shish'}
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

        <form onSubmit={handleSubmit}>
          <div className="discount-form-body">
            {error && (
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
                {error}
              </div>
            )}

            <div className="form-field">
              <label className="form-label">Mahsulot</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData((prev) => ({ ...prev, productId: e.target.value }))}
                className="form-select"
              >
                <option value="">Barcha mahsulotlar uchun</option>
                {products.map((p) => (
                  <option key={p.id || p.slug} value={p.id || p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Chegirma turi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="form-select"
                >
                  <option value="percentage">Foiz (%)</option>
                  <option value="fixed">Belgilangan summa (so‘m)</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">
                  Miqdori {formData.type === 'percentage' ? '(%)' : '(so‘m)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={formData.type === 'percentage' ? 100 : undefined}
                  step={formData.type === 'percentage' ? 1 : 1000}
                  required
                  value={formData.value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Boshlanish sanasi</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Tugash sanasi</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <label className="form-checkbox-row">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 550 }}>
                Chegirma faol holatda
              </span>
            </label>
          </div>

          <div className="discount-form-footer">
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
                <span>{discount ? 'Saqlash' : 'Qo‘shish'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

