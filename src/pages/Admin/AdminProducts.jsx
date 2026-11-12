import React, { useState } from 'react';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import ProductTable from '../../components/Admin/ProductManager/ProductTable';
import ProductForm from '../../components/Admin/ProductManager/ProductForm';
import ConfirmDialog from '../../components/Admin/Shared/ConfirmDialog';
import LoadingState from '../../components/Admin/Shared/LoadingState';
import ErrorState from '../../components/Admin/Shared/ErrorState';
import './AdminProducts.css';

export default function AdminProducts() {
  const {
    products,
    categories,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedVisibility,
    setSelectedVisibility,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleVisibility,
    reload
  } = useAdminProducts();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id || editingProduct.slug, formData);
      } else {
        await createProduct(formData);
      }
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      alert(err.message || 'Mahsulotni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteProduct(deleteTarget.id || deleteTarget.slug);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      alert(err.message || 'Mahsulotni o‘chirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingState message="Mahsulotlar yuklanmoqda..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="admin-products-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Mahsulotlar katalogi</h1>
          <p className="admin-page-subtitle">
            Katalogdagi tabiiy tosh mahsulotlarini qo‘shish, tahrirlash va narxlarni boshqarish
          </p>
        </div>
      </div>

      <ProductTable
        products={products}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedVisibility={selectedVisibility}
        onVisibilityChange={setSelectedVisibility}
        onEdit={handleOpenEdit}
        onDelete={(p) => setDeleteTarget(p)}
        onToggleVisibility={toggleVisibility}
        onAdd={handleOpenAdd}
      />

      <ProductForm
        product={editingProduct}
        categories={categories}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Mahsulotni o‘chirish"
        message={`Haqiqatan ham "${deleteTarget?.name}" mahsulotini o‘chirib tashlamoqchimisiz? Ushbu amal qaytarilmaydi.`}
        confirmLabel="O‘chirish"
        isDanger={true}
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

