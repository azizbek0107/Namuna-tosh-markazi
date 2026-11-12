import { useState, useEffect, useCallback } from 'react';
import {
  fetchAllAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility
} from '../services/productService.js';
import { categoryService } from '../services/categoryService.js';

export function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, catData] = await Promise.all([
        fetchAllAdminProducts(),
        categoryService.fetchCategories()
      ]);
      setProducts(Array.isArray(prodData) ? prodData : prodData?.products || []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      setError(err?.message || 'Mahsulotlarni yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();

    const handleSync = () => {
      loadProducts();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('namuna:categories-updated', handleSync);
      window.addEventListener('namuna:products-updated', handleSync);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('namuna:categories-updated', handleSync);
        window.removeEventListener('namuna:products-updated', handleSync);
      }
    };
  }, [loadProducts]);

  const handleCreate = async (payload) => {
    const result = await createProduct(payload);
    if (!result.error) {
      await loadProducts();
    }
    return result;
  };

  const handleUpdate = async (id, payload) => {
    const result = await updateProduct(id, payload);
    if (!result.error) {
      await loadProducts();
    }
    return result;
  };

  const handleDelete = async (idOrProduct) => {
    const id = typeof idOrProduct === 'object' ? (idOrProduct.id || idOrProduct.slug) : idOrProduct;
    const result = await deleteProduct(id);
    if (result.success) {
      setProducts(prev => prev.filter(p => p.id !== id && p.slug !== id));
    }
    return result;
  };

  const handleToggleVisibility = async (idOrProduct, explicitNext) => {
    let id;
    let next;
    if (typeof idOrProduct === 'object') {
      id = idOrProduct.id || idOrProduct.slug;
      const current = idOrProduct.isVisible ?? idOrProduct.is_active ?? true;
      next = explicitNext !== undefined ? explicitNext : !current;
    } else {
      id = idOrProduct;
      next = explicitNext;
    }

    setProducts(prev => prev.map(p => (p.id === id || p.slug === id) ? { ...p, isVisible: next } : p));
    const result = await toggleProductVisibility(id, next);
    if (result.error) {
      await loadProducts();
    }
    return result;
  };

  // Filtered products list
  const filteredProducts = products.filter(product => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = product.name?.toLowerCase().includes(q);
      const matchDesc = product.description?.toLowerCase().includes(q);
      const matchSlug = product.slug?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchSlug) return false;
    }
    // Category filter
    if (categoryFilter !== 'all') {
      const matchesCategory =
        product.category === categoryFilter ||
        product.categoryId === categoryFilter ||
        product.category_id === categoryFilter ||
        (product.categories || []).includes(categoryFilter);
      if (!matchesCategory) return false;
    }
    // Visibility filter
    const isVisible = product.isVisible ?? product.is_active ?? true;
    if (visibilityFilter === 'visible' && !isVisible) return false;
    if (visibilityFilter === 'hidden' && isVisible) return false;

    return true;
  });

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    selectedCategory: categoryFilter,
    setSelectedCategory: setCategoryFilter,
    visibilityFilter,
    setVisibilityFilter,
    selectedVisibility: visibilityFilter,
    setSelectedVisibility: setVisibilityFilter,
    refresh: loadProducts,
    reload: loadProducts,
    createProduct: handleCreate,
    updateProduct: handleUpdate,
    deleteProduct: handleDelete,
    toggleVisibility: handleToggleVisibility,
  };
}

export default useAdminProducts;
