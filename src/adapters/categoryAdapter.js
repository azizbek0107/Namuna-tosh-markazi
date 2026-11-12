/**
 * categoryAdapter.js
 * 
 * Maps categories from StoneX ERP into the standard website category format.
 */

export function adaptErpCategory(raw) {
  if (!raw) return null;

  const id = String(raw.id || raw.code || raw.slug || '').trim();
  const name = String(raw.name || raw.title || id).trim();
  const slug = String(raw.slug || id)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-');

  return {
    id: id || slug,
    name,
    slug,
    description: raw.description || '',
    displayOrder: Number(raw.display_order ?? raw.order ?? 0),
    isVisible: raw.is_visible !== false && raw.active !== false,
  };
}

export function adaptErpCategories(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map(adaptErpCategory)
    .filter(Boolean)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export default {
  adaptErpCategory,
  adaptErpCategories,
};

