import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Layers, Loader2, X } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import ConfirmDialog from '../../components/Admin/Shared/ConfirmDialog';
import LoadingState from '../../components/Admin/Shared/LoadingState';
import ErrorState from '../../components/Admin/Shared/ErrorState';
import './AdminCategories.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Kategoriyalarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const updates = { name: val };
    if (!editingCategory) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Kategoriya nomi kiritilishi shart.');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Kategoriya identifikatori (slug) kiritilishi shart.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      setFormError(err.message || 'Kategoriyani saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await categoryService.deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Kategoriyani o‘chirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingState message="Kategoriyalar yuklanmoqda..." />;
  if (error) return <ErrorState message={error} onRetry={loadCategories} />;

  return (
    <div className="admin-categories-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Kategoriyalar boshqaruvi</h1>
          <p className="admin-page-subtitle">
            Tosh mahsulotlari guruhlari va turlarini sozlash
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))',
            color: '#0d0d0d',
            border: 'none',
            borderRadius: 2
          }}
        >
          <Plus size={16} />
          <span>Yangi kategoriya</span>
        </button>
      </div>

      <div className="category-table-wrapper">
        <table className="category-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Kategoriya nomi</th>
              <th>Identifikator (Slug)</th>
              <th>Tavsif</th>
              <th style={{ textAlign: 'right', width: 100 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  Kategoriyalar mavjud emas
                </td>
              </tr>
            ) : (
              categories.map((cat, idx) => (
                <tr key={cat.id || cat.slug}>
                  <td>{idx + 1}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cat.name}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)', fontSize: 12 }}>
                      {cat.slug}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {cat.description || '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="table-action-btn"
                        onClick={() => handleOpenEdit(cat)}
                        title="Tahrirlash"
                        aria-label={`${cat.name}ni tahrirlash`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="table-action-btn is-delete"
                        onClick={() => setDeleteTarget(cat)}
                        title="O‘chirish"
                        aria-label={`${cat.name}ni o‘chirish`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Category Modal Form */}
      {isModalOpen && (
        <div className="product-form-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="product-form-modal"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="product-form-header">
              <h2 className="product-form-title">
                {editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
              </h2>
              <button
                type="button"
                className="product-form-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Yopish"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="product-form-body">
                {formError && (
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
                    {formError}
                  </div>
                )}

                <div className="form-field">
                  <label className="form-label">
                    Kategoriya nomi <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    className="form-input"
                    placeholder="Masalan: Granit"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Slug <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="form-input"
                    placeholder="granit"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Tavsif</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="form-textarea"
                    placeholder="Kategoriya haqida qisqacha ma‘lumot..."
                  />
                </div>
              </div>

              <div className="product-form-footer">
                <button
                  type="button"
                  className="form-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
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
                    <span>{editingCategory ? 'Saqlash' : 'Qo‘shish'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Kategoriyani o‘chirish"
        message={`Haqiqatan ham "${deleteTarget?.name}" kategoriyasini o‘chirmoqchimisiz?`}
        confirmLabel="O‘chirish"
        isDanger={true}
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

