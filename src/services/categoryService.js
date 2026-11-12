import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { categories as defaultCategories } from '../data/categories.js';

const STORAGE_KEY_CATEGORIES = 'namuna_categories_store';

const initialCategories = defaultCategories
  .filter((c) => c.id !== 'all' && !['sokl', 'zinapoyalar', 'pol-plitalari', 'buyurtma'].includes(c.id))
  .map((c, i) => ({
    id: c.id,
    name: c.name,
    slug: c.id,
    description: '',
    display_order: i + 1,
    is_visible: true
  }));

const OLD_CATEGORY_IDS = new Set(['all', 'sokl', 'zinapoyalar', 'pol-plitalari', 'buyurtma']);

function loadStoredCategories() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((c) => !OLD_CATEGORY_IDS.has(c.id) && !OLD_CATEGORY_IDS.has(c.slug));
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch {}
  }
  return [...initialCategories];
}

function persistStoredCategories(list) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('namuna:categories-updated', { detail: list }));
    } catch {}
  }
}

let memoryCategories = loadStoredCategories();

export const categoryService = {
  async fetchCategories() {
    if (!isSupabaseConfigured) {
      if (typeof window !== 'undefined') {
        memoryCategories = loadStoredCategories();
      }
      return [...memoryCategories];
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        if (typeof window !== 'undefined') {
          memoryCategories = loadStoredCategories();
        }
        return [...memoryCategories];
      }

      return data;
    } catch {
      if (typeof window !== 'undefined') {
        memoryCategories = loadStoredCategories();
      }
      return [...memoryCategories];
    }
  },

  async createCategory({ id, name, slug, description = '', displayOrder = 0, isVisible = true }) {
    const finalId = id || slug || name.trim().toLowerCase().replace(/['`ʻʼ]/g, '').replace(/[^a-z0-9_-]/g, '-');
    const finalSlug = slug || finalId;
    const newCategory = {
      id: finalId,
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      display_order: Number(displayOrder) || 0,
      is_visible: Boolean(isVisible)
    };

    if (!isSupabaseConfigured) {
      const current = typeof window !== 'undefined' ? loadStoredCategories() : memoryCategories;
      const filtered = current.filter((c) => c.id !== finalId && c.slug !== finalSlug);
      memoryCategories = [...filtered, newCategory];
      persistStoredCategories(memoryCategories);
      return { data: newCategory, error: null, ...newCategory };
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          id: finalId,
          name: name.trim(),
          display_order: Number(displayOrder) || 0,
          is_visible: Boolean(isVisible)
        }])
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data, error: null, ...data };
    } catch (err) {
      return { data: null, error: err?.message || 'Kategoriya yaratishda xatolik yuz berdi.' };
    }
  },

  async updateCategory(id, { name, slug, description, displayOrder, isVisible }) {
    if (!isSupabaseConfigured) {
      const current = typeof window !== 'undefined' ? loadStoredCategories() : memoryCategories;
      const idx = current.findIndex((c) => String(c.id) === String(id) || String(c.slug) === String(id));
      if (idx !== -1) {
        if (name !== undefined) current[idx].name = name.trim();
        if (slug !== undefined) current[idx].slug = slug.trim();
        if (description !== undefined) current[idx].description = description.trim();
        if (displayOrder !== undefined) current[idx].display_order = Number(displayOrder);
        if (isVisible !== undefined) current[idx].is_visible = Boolean(isVisible);
        memoryCategories = [...current];
        persistStoredCategories(memoryCategories);
        return { data: memoryCategories[idx], error: null, ...memoryCategories[idx] };
      }
      return { data: null, error: 'Kategoriya topilmadi' };
    }

    try {
      const updates = {};
      if (name !== undefined) updates.name = name.trim();
      if (displayOrder !== undefined) updates.display_order = Number(displayOrder);
      if (isVisible !== undefined) updates.is_visible = Boolean(isVisible);

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data, error: null, ...data };
    } catch (err) {
      return { data: null, error: err?.message || 'Kategoriyani yangilashda xatolik yuz berdi.' };
    }
  },

  async deleteCategory(id) {
    if (!isSupabaseConfigured) {
      const current = typeof window !== 'undefined' ? loadStoredCategories() : memoryCategories;
      memoryCategories = current.filter((c) => String(c.id) !== String(id) && String(c.slug) !== String(id));
      persistStoredCategories(memoryCategories);
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err?.message || 'Kategoriyani o‘chirishda xatolik yuz berdi.' };
    }
  }
};

export default categoryService;
