import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { TELEGRAM_USERNAME, TELEGRAM_URL } from '../config/contactConfig.js';

export const defaultSettings = {
  businessName: 'Namuna Tosh Markazi',
  telegramUsername: TELEGRAM_USERNAME,
  telegramChannelUrl: 'https://t.me/sevgi_va_hayot01',
  telegramPhone: '+998901234567',
  instagram: 'namunatoshjilo',
  instagramUrl: 'https://www.instagram.com/azik_axi_0107/',
  youtubeChannelHandle: 'uzb_yigiti_0107',
  youtubeUrl: '',
  contactPhone: '+998 90 123 45 67',
  phone1: '+998 90 123 45 67',
  phone2: '+998 93 765 43 21',
  businessAddress: 'Navoiy viloyati, G‘azg‘on shahri, Toshchilar ko‘chasi, 12-uy',
  address: 'Navoiy viloyati, G‘azg‘on shahri, Toshchilar ko‘chasi, 12-uy',
  workingHours: 'Dushanba - Shanba: 08:00 - 18:00',
  email: 'info@namunatosh.uz',
  mapUrl: '',
};

const STORAGE_KEY_SETTINGS = 'namuna_settings_store';

function loadStoredSettings() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch {}
  }
  return { ...defaultSettings };
}

function persistStoredSettings(data) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('namuna:settings-updated'));
    } catch {}
  }
}

let memorySettings = loadStoredSettings();

export const settingsService = {
  async fetchSettings() {
    if (!isSupabaseConfigured) {
      return { ...memorySettings };
    }

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'general')
        .maybeSingle();

      if (error || !data) {
        return { ...memorySettings };
      }

      return { ...memorySettings, ...(data.value || {}) };
    } catch {
      return { ...memorySettings };
    }
  },

  async updateSettings(newSettings) {
    memorySettings = { ...memorySettings, ...newSettings };
    if (newSettings.phone1) memorySettings.contactPhone = newSettings.phone1;
    if (newSettings.contactPhone) memorySettings.phone1 = newSettings.contactPhone;
    if (newSettings.address) memorySettings.businessAddress = newSettings.address;

    persistStoredSettings(memorySettings);

    if (!isSupabaseConfigured) {
      return { data: { ...memorySettings }, error: null, isMock: true, ...memorySettings };
    }

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'general',
          value: memorySettings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data.value, error: null, ...data.value };
    } catch (err) {
      return { data: null, error: err?.message || 'Sozlamalarni saqlashda xatolik yuz berdi.' };
    }
  },
};

export default settingsService;
