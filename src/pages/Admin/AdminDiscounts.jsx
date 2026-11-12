import React, { useState, useEffect } from 'react';
import { useAdminDiscounts } from '../../hooks/useAdminDiscounts';
import { productService } from '../../services/productService';
import DiscountTable from '../../components/Admin/DiscountManager/DiscountTable';
import DiscountForm from '../../components/Admin/DiscountManager/DiscountForm';
import ConfirmDialog from '../../components/Admin/Shared/ConfirmDialog';
import LoadingState from '../../components/Admin/Shared/LoadingState';
import ErrorState from '../../components/Admin/Shared/ErrorState';
import './AdminDiscounts.css';

export default function AdminDiscounts() {
  const {
    discounts,
    loading,
    error,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscount,
    reload
  } = useAdminDiscounts();

  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    productService.fetchAllAdminProducts().then((res) => {
      setProducts(res.products || []);
    });
  }, []);

  const handleOpenAdd = () => {
    setEditingDiscount(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (discount) => {
    setEditingDiscount(discount);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, formData);
      } else {
        await createDiscount(formData);
      }
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      alert(err.message || 'Chegirmani saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteDiscount(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      alert(err.message || 'Chegirmani o‘chirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingState message="Chegirmalar yuklanmoqda..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="admin-discounts-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Chegirmalar va aksiyalar</h1>
          <p className="admin-page-subtitle">
            Mahsulotlar uchun maxsus narxlar va muddatli takliflarni boshqarish
          </p>
        </div>
      </div>

      <DiscountTable
        discounts={discounts}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(d) => setDeleteTarget(d)}
        onToggle={toggleDiscount}
      />

      <DiscountForm
        discount={editingDiscount}
        products={products}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Chegirmani o‘chirish"
        message="Haqiqatan ham bu chegirmani o‘chirib tashlamoqchimisiz? Ushbu amal narxlarga darhol ta‘sir qiladi."
        confirmLabel="O‘chirish"
        isDanger={true}
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

