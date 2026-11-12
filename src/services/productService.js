import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { products as localProducts } from '../data/products.js';
import { erpApi } from './erpApi.js';
import { ERP_ENDPOINTS, IS_ERP_CONFIGURED } from '../config/apiConfig.js';
import { adaptErpProduct, adaptErpProducts } from '../adapters/productAdapter.js';

const STORAGE_KEY_PRODUCTS = 'namuna_products_store';

function loadStoredProducts() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length >= localProducts.length) {
          return parsed;
        }
      }
    } catch {}
  }
  return [...localProducts];
}

function persistStoredProducts(list) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('namuna:products-updated'));
    } catch {}
  }
}

// In-memory working copy with browser localStorage persistence for live admin synchronization
let memoryProducts = loadStoredProducts();

/**
 * Normalizes a database product record into the standard application format.
 */
function normalizeDbProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    category: row.category,
    categories: (row.product_categories || []).map(pc => pc.category_id || pc.category?.id || pc).filter(Boolean),
    price: row.price !== null && row.price !== undefined ? Number(row.price) : null,
    priceUnit: row.price_unit || 'm2',
    isVisible: Boolean(row.is_visible),
    isFeatured: Boolean(row.is_featured),
    orderConfig: row.order_config || { quantityModes: ['direct', 'pieces'], defaultQuantityMode: 'direct', linearLengthField: 'lengthCm' },
    sizes: (row.product_sizes || []).map(s => ({
      widthCm: Number(s.width_cm),
      lengthCm: Number(s.length_cm),
      thicknessMm: Number(s.thickness_mm) || 0,
    })),
    images: (row.product_images || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(img => ({
      src: img.image_url,
      alt: img.alt_text || row.name,
      width: img.width || 1024,
      height: img.height || 1024,
    })),
    discountType: row.discounts?.[0]?.discount_type || null,
    discountValue: row.discounts?.[0]?.discount_value ? Number(row.discounts[0].discount_value) : 0,
    discountStartsAt: row.discounts?.[0]?.starts_at || null,
    discountEndsAt: row.discounts?.[0]?.ends_at || null,
    discountIsActive: row.discounts?.[0]?.is_active ?? false,
    createdAt: row.created_at,
  };
}

/**
 * Public catalog query — fetches only visible products.
 * Queries StoneX ERP if configured, otherwise falls back to database / local records.
 */
export async function fetchProducts({ signal } = {}) {
  signal?.throwIfAborted();

  const isTestEnv = typeof globalThis !== 'undefined' && Boolean(globalThis.IS_REACT_ACT_ENVIRONMENT);

  if (!isTestEnv && IS_ERP_CONFIGURED) {
    try {
      const { data, error } = await erpApi.getProducts({ signal });
      if (!error && Array.isArray(data) && data.length > 0) {
        return adaptErpProducts(data).filter(p => p.isVisible);
      }
    } catch {
      // Graceful fallback
    }
  }

  if (!isSupabaseConfigured) {
    return memoryProducts.filter(product => product.isVisible === true);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(category_id),
        product_sizes(*),
        product_images(*),
        discounts(*)
      `)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return memoryProducts.filter(product => product.isVisible === true);
    }

    return data.map(normalizeDbProduct);
  } catch {
    return memoryProducts.filter(product => product.isVisible === true);
  }
}

/**
 * Public product details query by slug.
 */
export async function fetchProductBySlug(slug, options = {}) {
  const visibleProducts = await fetchProducts(options);
  return visibleProducts.find(product => product.slug === slug || String(product.id) === String(slug) || String(product.erpId) === String(slug)) ?? null;
}

/**
 * Admin query — fetches all products including hidden ones.
 * Reads from StoneX ERP when available.
 */
export async function fetchAllAdminProducts() {
  const isTestEnv = typeof globalThis !== 'undefined' && Boolean(globalThis.IS_REACT_ACT_ENVIRONMENT);

  if (!isTestEnv && IS_ERP_CONFIGURED) {
    try {
      const { data, error } = await erpApi.getProducts();
      if (!error && Array.isArray(data) && data.length > 0) {
        return adaptErpProducts(data);
      }
    } catch {
      // Fallback
    }
  }

  if (!isSupabaseConfigured) {
    return [...memoryProducts];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(category_id),
        product_sizes(*),
        product_images(*),
        discounts(*)
      `)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [...memoryProducts];
    }

    return data.map(normalizeDbProduct);
  } catch {
    return [...memoryProducts];
  }
}

/**
 * Admin action — creates new product.
 */
export async function createProduct(payload) {
  const newId = payload.id || `prod-${Date.now()}`;
  const slug = payload.slug || newId;

  if (!isSupabaseConfigured) {
    const lengthNum = payload.tile_length !== undefined && payload.tile_length !== '' ? Number(payload.tile_length) : (payload.sizes?.[0]?.lengthCm ?? payload.availableSizes?.[0]?.lengthCm ?? null);
    const widthNum = payload.tile_width !== undefined && payload.tile_width !== '' ? Number(payload.tile_width) : (payload.sizes?.[0]?.widthCm ?? payload.availableSizes?.[0]?.widthCm ?? null);
    const thicknessNum = payload.thickness !== undefined && payload.thickness !== '' ? Number(payload.thickness) : (payload.sizes?.[0]?.thicknessMm ?? payload.availableSizes?.[0]?.thicknessMm ?? null);
    const boxPiecesNum = payload.box_pieces !== undefined && payload.box_pieces !== '' ? Number(payload.box_pieces) : (payload.sizes?.[0]?.piecesPerBox ?? payload.availableSizes?.[0]?.piecesPerBox ?? null);
    const boxM2Num = payload.box_m2 !== undefined && payload.box_m2 !== '' ? Number(payload.box_m2) : (lengthNum && widthNum && boxPiecesNum ? Math.round((lengthNum * widthNum * boxPiecesNum / 10000) * 1000) / 1000 : null);
    const costPriceNum = payload.cost_price !== undefined && payload.cost_price !== '' ? Number(payload.cost_price) : (payload.costPrice !== undefined && payload.costPrice !== '' ? Number(payload.costPrice) : null);
    const stockNum = payload.stock !== undefined && payload.stock !== '' ? Number(payload.stock) : (payload.stock_quantity !== undefined && payload.stock_quantity !== '' ? Number(payload.stock_quantity) : null);
    const unit = payload.unit || payload.priceUnit || 'm2';

    let sizes = Array.isArray(payload.availableSizes)
      ? payload.availableSizes
      : Array.isArray(payload.sizes)
      ? payload.sizes
      : [];

    if (sizes.length === 0 && (lengthNum || widthNum)) {
      sizes = [{
        lengthCm: lengthNum || 0,
        widthCm: widthNum || 0,
        thicknessMm: thicknessNum || 0,
        piecesPerBox: boxPiecesNum || 1,
      }];
    }

    const rawImages = payload.images || (payload.image ? [{ src: payload.image, url: payload.image }] : []);
    const normalizedImages = rawImages.map(img => typeof img === 'string' ? { src: img, url: img } : { src: img.src || img.url, url: img.url || img.src, ...img });

    const created = {
      ...payload,
      id: newId,
      slug,
      name: payload.name.trim(),
      description: payload.description || '',
      category: payload.category || 'kerama-granit',
      categories: [payload.category || 'kerama-granit'],
      isVisible: payload.isVisible ?? true,
      price: payload.price !== undefined && payload.price !== '' ? Number(payload.price) : null,
      cost_price: costPriceNum,
      costPrice: costPriceNum,
      priceUnit: unit,
      unit: unit,
      tile_length: lengthNum,
      tile_width: widthNum,
      thickness: thicknessNum,
      box_pieces: boxPiecesNum,
      box_m2: boxM2Num,
      stock: stockNum,
      sizes,
      availableSizes: sizes,
      images: normalizedImages,
      image: normalizedImages[0]?.src || normalizedImages[0]?.url || payload.image || '',
      orderConfig: payload.orderConfig || { quantityModes: ['direct', 'pieces'], defaultQuantityMode: 'direct', linearLengthField: 'lengthCm' },
      createdAt: new Date().toISOString(),
    };

    memoryProducts = [created, ...memoryProducts];
    persistStoredProducts(memoryProducts);

    return { data: created, error: null };
  }

  try {
    const { data: productRow, error: pError } = await supabase
      .from('products')
      .insert([{
        slug,
        name: payload.name.trim(),
        description: payload.description || '',
        category: payload.category || 'keramogranit',
        price: payload.price !== '' && payload.price !== null ? Number(payload.price) : null,
        price_unit: payload.priceUnit || 'm2',
        is_visible: payload.isVisible !== undefined ? Boolean(payload.isVisible) : true,
        is_featured: Boolean(payload.isFeatured),
        order_config: payload.orderConfig || { quantityModes: ['direct', 'pieces'], defaultQuantityMode: 'direct', linearLengthField: 'lengthCm' },
      }])
      .select()
      .single();

    if (pError) return { data: null, error: pError.message };

    const productId = productRow.id;

    // Insert sizes if provided
    if (Array.isArray(payload.sizes) && payload.sizes.length > 0) {
      const sizeRows = payload.sizes.map(s => ({
        product_id: productId,
        width_cm: Number(s.widthCm),
        length_cm: Number(s.lengthCm),
        thickness_mm: Number(s.thicknessMm) || 0,
      }));
      await supabase.from('product_sizes').insert(sizeRows);
    }

    // Insert images if provided
    if (Array.isArray(payload.images) && payload.images.length > 0) {
      const imgRows = payload.images.map((img, i) => ({
        product_id: productId,
        image_url: img.src || img.url || img,
        alt_text: img.alt || payload.name,
        display_order: i,
        is_primary: i === 0,
      }));
      await supabase.from('product_images').insert(imgRows);
    }

    const { data: fullProduct } = await supabase
      .from('products')
      .select('*, product_categories(category_id), product_sizes(*), product_images(*)')
      .eq('id', productId)
      .single();

    return { data: normalizeDbProduct(fullProduct) || productRow, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Mahsulot saqlashda xatolik yuz berdi.' };
  }
}

/**
 * Admin action — updates existing product.
 */
export async function updateProduct(id, payload) {
  if (!isSupabaseConfigured) {
    const idx = memoryProducts.findIndex(p => p.id === id || p.slug === id);
    if (idx !== -1) {
      const existing = memoryProducts[idx];
      const lengthNum = payload.tile_length !== undefined ? (payload.tile_length !== '' && payload.tile_length !== null ? Number(payload.tile_length) : null) : existing.tile_length;
      const widthNum = payload.tile_width !== undefined ? (payload.tile_width !== '' && payload.tile_width !== null ? Number(payload.tile_width) : null) : existing.tile_width;
      const thicknessNum = payload.thickness !== undefined ? (payload.thickness !== '' && payload.thickness !== null ? Number(payload.thickness) : null) : existing.thickness;
      const boxPiecesNum = payload.box_pieces !== undefined ? (payload.box_pieces !== '' && payload.box_pieces !== null ? Number(payload.box_pieces) : null) : existing.box_pieces;
      const boxM2Num = payload.box_m2 !== undefined ? (payload.box_m2 !== '' && payload.box_m2 !== null ? Number(payload.box_m2) : null) : (lengthNum && widthNum && boxPiecesNum ? Math.round((lengthNum * widthNum * boxPiecesNum / 10000) * 1000) / 1000 : existing.box_m2);
      const costPriceNum = payload.cost_price !== undefined ? (payload.cost_price !== '' && payload.cost_price !== null ? Number(payload.cost_price) : null) : (payload.costPrice !== undefined ? (payload.costPrice !== '' && payload.costPrice !== null ? Number(payload.costPrice) : null) : existing.cost_price);
      const stockNum = payload.stock !== undefined ? (payload.stock !== '' && payload.stock !== null ? Number(payload.stock) : null) : existing.stock;
      const unit = payload.unit || payload.priceUnit || existing.unit || existing.priceUnit || 'm2';

      let updatedSizes = payload.availableSizes || payload.sizes || existing.sizes || [];
      if ((payload.tile_length !== undefined || payload.tile_width !== undefined) && (lengthNum || widthNum)) {
        updatedSizes = [{
          lengthCm: lengthNum || 0,
          widthCm: widthNum || 0,
          thicknessMm: thicknessNum || 0,
          piecesPerBox: boxPiecesNum || 1,
        }];
      }
      const updatedImages = payload.images || (payload.image ? [{ src: payload.image, url: payload.image }] : existing.images);

      memoryProducts[idx] = {
        ...existing,
        ...payload,
        unit,
        priceUnit: unit,
        tile_length: lengthNum,
        tile_width: widthNum,
        thickness: thicknessNum,
        box_pieces: boxPiecesNum,
        box_m2: boxM2Num,
        cost_price: costPriceNum,
        costPrice: costPriceNum,
        stock: stockNum,
        sizes: updatedSizes,
        availableSizes: updatedSizes,
        images: updatedImages,
        image: payload.image || updatedImages?.[0]?.src || updatedImages?.[0]?.url || existing.image,
      };

      persistStoredProducts(memoryProducts);
      return { data: memoryProducts[idx], error: null };
    }
    return { data: null, error: 'Mahsulot topilmadi.' };
  }

  try {
    const updates = {};
    if (payload.name !== undefined) updates.name = payload.name.trim();
    if (payload.slug !== undefined) updates.slug = payload.slug.trim();
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.category !== undefined) updates.category = payload.category;
    if (payload.price !== undefined) updates.price = payload.price !== '' && payload.price !== null ? Number(payload.price) : null;
    if (payload.priceUnit !== undefined) updates.price_unit = payload.priceUnit;
    if (payload.isVisible !== undefined) updates.is_visible = Boolean(payload.isVisible);
    if (payload.isFeatured !== undefined) updates.is_featured = Boolean(payload.isFeatured);
    updates.updated_at = new Date().toISOString();

    const { data: updatedRow, error: pError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (pError) return { data: null, error: pError.message };

    // Update sizes if provided
    if (payload.sizes !== undefined) {
      await supabase.from('product_sizes').delete().eq('product_id', id);
      if (payload.sizes.length > 0) {
        const sizeRows = payload.sizes.map(s => ({
          product_id: id,
          width_cm: Number(s.widthCm),
          length_cm: Number(s.lengthCm),
          thickness_mm: Number(s.thicknessMm) || 0,
        }));
        await supabase.from('product_sizes').insert(sizeRows);
      }
    }

    return { data: updatedRow, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Mahsulot yangilashda xatolik yuz berdi.' };
  }
}

/**
 * Admin action — deletes product.
 */
export async function deleteProduct(id) {
  if (!isSupabaseConfigured) {
    memoryProducts = memoryProducts.filter(p => p.id !== id && p.slug !== id);
    persistStoredProducts(memoryProducts);
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err?.message || 'Mahsulotni o‘chirishda xatolik yuz berdi.' };
  }
}

/**
 * Admin action — quick toggle product visibility.
 */
export async function toggleProductVisibility(id, isVisible) {
  return updateProduct(id, { isVisible });
}

export const productService = {
  fetchProducts,
  fetchProductBySlug,
  fetchAllAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
};

export default productService;
