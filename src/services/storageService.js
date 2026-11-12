import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const BUCKET_NAME = 'product-images';

export const storageService = {
  async uploadProductImage(file, productId = 'general') {
    if (!isSupabaseConfigured) {
      // Mock local URL for development when Supabase is not yet linked
      return {
        url: URL.createObjectURL(file),
        path: null,
        error: null,
        isMock: true,
      };
    }

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanProductId = String(productId).replace(/[^a-zA-Z0-9_-]/g, '');
      const uniqueFileName = `${cleanProductId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { url: null, path: null, error: error.message };
      }

      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        url: publicData.publicUrl,
        path: data.path,
        error: null,
      };
    } catch (err) {
      return {
        url: null,
        path: null,
        error: err?.message || 'Rasm yuklashda kutilmagan xatolik yuz berdi.',
      };
    }
  },

  async deleteProductImage(path) {
    if (!isSupabaseConfigured || !path) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err?.message || 'Rasmni o\u02BBchirishda xatolik yuz berdi.' };
    }
  },
};

