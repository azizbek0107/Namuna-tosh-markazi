import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { updateProduct } from './productService.js';

const STORAGE_KEY_DISCOUNTS = 'namuna_discounts_store';

const initialDiscounts = [
  {
    id: 'disc-1',
    productId: 'angola-black',
    product_id: 'angola-black',
    productName: 'Angola Black Granit',
    type: 'percentage',
    discount_type: 'percentage',
    value: 10,
    discount_value: 10,
    startDate: '2026-11-01',
    starts_at: '2026-11-01',
    endDate: '2026-12-31',
    ends_at: '2026-12-31',
    isActive: true,
    is_active: true
  }
];

function loadStoredDiscounts() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(STORAGE_KEY_DISCOUNTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
  }
  return [...initialDiscounts];
}

function persistStoredDiscounts(list) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_DISCOUNTS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('namuna:discounts-updated'));
    } catch {}
  }
}

let memoryDiscounts = loadStoredDiscounts();

function syncDiscountToProduct(discount, isDeleted = false) {
  if (!discount?.productId) return;
  try {
    const isActive = isDeleted ? false : Boolean(discount.isActive ?? discount.is_active);
    updateProduct(discount.productId, {
      discountType: isDeleted ? null : discount.type,
      discountValue: isDeleted ? 0 : discount.value,
      discountStartsAt: isDeleted ? null : discount.startDate,
      discountEndsAt: isDeleted ? null : discount.endDate,
      discountIsActive: isActive,
      discount: {
        type: isDeleted ? null : discount.type,
        value: isDeleted ? 0 : discount.value,
        startDate: isDeleted ? null : discount.startDate,
        endDate: isDeleted ? null : discount.endDate,
        isActive: isActive,
      }
    });
  } catch {}
}

export const discountService = {
  async fetchDiscounts() {
    if (!isSupabaseConfigured) {
      return [...memoryDiscounts];
    }

    try {
      const { data, error } = await supabase
        .from('discounts')
        .select(`
          *,
          product:products (id, name, slug, price, price_unit)
        `)
        .order('created_at', { ascending: false });

      if (error || !data) return [...memoryDiscounts];
      return data;
    } catch {
      return [...memoryDiscounts];
    }
  },

  async createDiscount(payload) {
    const productId = payload.productId || payload.product_id;
    const type = payload.type || payload.discount_type || 'percentage';
    const value = Number(payload.value ?? payload.discount_value ?? 0);
    const startDate = payload.startDate || payload.starts_at || null;
    const endDate = payload.endDate || payload.ends_at || null;
    const isActive = Boolean(payload.isActive ?? payload.is_active ?? true);
    const productName = payload.productName || 'Barcha mahsulotlar';

    const item = {
      id: `disc-${Date.now()}`,
      productId,
      product_id: productId,
      productName,
      type,
      discount_type: type,
      value,
      discount_value: value,
      startDate,
      starts_at: startDate,
      endDate,
      ends_at: endDate,
      isActive,
      is_active: isActive
    };

    if (!isSupabaseConfigured) {
      memoryDiscounts = [item, ...memoryDiscounts];
      persistStoredDiscounts(memoryDiscounts);
      syncDiscountToProduct(item);
      return { data: item, error: null, ...item };
    }

    try {
      const { data, error } = await supabase
        .from('discounts')
        .insert([{
          product_id: productId || null,
          discount_type: type,
          discount_value: value,
          starts_at: startDate,
          ends_at: endDate,
          is_active: isActive,
        }])
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      syncDiscountToProduct(item);
      return { data, error: null, ...data };
    } catch (err) {
      return { data: null, error: err?.message || 'Chegirma yaratishda xatolik yuz berdi.' };
    }
  },

  async updateDiscount(id, updates) {
    if (!isSupabaseConfigured) {
      const idx = memoryDiscounts.findIndex((d) => d.id === id);
      if (idx !== -1) {
        memoryDiscounts[idx] = { ...memoryDiscounts[idx], ...updates };
        if (updates.value !== undefined) memoryDiscounts[idx].discount_value = updates.value;
        if (updates.type !== undefined) memoryDiscounts[idx].discount_type = updates.type;
        if (updates.isActive !== undefined) memoryDiscounts[idx].is_active = updates.isActive;
        persistStoredDiscounts(memoryDiscounts);
        syncDiscountToProduct(memoryDiscounts[idx]);
        return { data: memoryDiscounts[idx], error: null, ...memoryDiscounts[idx] };
      }
      return { data: null, error: 'Chegirma topilmadi' };
    }

    try {
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('discounts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      const idx = memoryDiscounts.findIndex((d) => d.id === id);
      if (idx !== -1) syncDiscountToProduct({ ...memoryDiscounts[idx], ...updates });
      return { data, error: null, ...data };
    } catch (err) {
      return { data: null, error: err?.message || 'Chegirmani yangilashda xatolik yuz berdi.' };
    }
  },

  async toggleDiscount(id, nextActive) {
    if (!isSupabaseConfigured) {
      const idx = memoryDiscounts.findIndex((d) => d.id === id);
      if (idx !== -1) {
        const next = nextActive !== undefined ? nextActive : !memoryDiscounts[idx].isActive;
        memoryDiscounts[idx].isActive = next;
        memoryDiscounts[idx].is_active = next;
        persistStoredDiscounts(memoryDiscounts);
        syncDiscountToProduct(memoryDiscounts[idx]);
        return { data: memoryDiscounts[idx], error: null, ...memoryDiscounts[idx] };
      }
      return { data: null, error: 'Chegirma topilmadi' };
    }

    try {
      const { data, error } = await supabase
        .from('discounts')
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      const idx = memoryDiscounts.findIndex((d) => d.id === id);
      if (idx !== -1) syncDiscountToProduct({ ...memoryDiscounts[idx], isActive: nextActive, is_active: nextActive });
      return { data, error: null, ...data };
    } catch (err) {
      return { data: null, error: err?.message || 'Chegirma holatini o‘zgartirishda xatolik yuz berdi.' };
    }
  },

  async deleteDiscount(id) {
    if (!isSupabaseConfigured) {
      const target = memoryDiscounts.find((d) => d.id === id);
      memoryDiscounts = memoryDiscounts.filter((d) => d.id !== id);
      persistStoredDiscounts(memoryDiscounts);
      if (target) syncDiscountToProduct(target, true);
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err?.message || 'Chegirmani o‘chirishda xatolik yuz berdi.' };
    }
  }
};

export default discountService;
