import { getLocalizedCategoryName } from '../utils/translations.js';

export const categories = [
  { id: 'all', name: 'Barcha mahsulotlar' },
  { id: 'kerama-granit', name: 'Keramogranit' },
  { id: 'granit', name: 'Granit' },
  { id: 'marmar', name: 'Marmar' },
  { id: 'xizmatlar', name: 'Xizmatlar' },
  { id: 'kafel', name: 'Kafel' },
  { id: 'tayyor-mahsulot', name: 'Tayyor mahsulot' },
  { id: 'qoshimcha', name: 'Qo‘shimcha' },
  { id: 'xomashyo', name: 'Xomashyo' },
];

const categoryLabels = {
  all: 'Barcha mahsulotlar',
  'kerama-granit': 'Kerama granit',
  keramogranit: 'Keramogranit',
  granit: 'Granit',
  marmar: 'Marmar',
  xizmatlar: 'Xizmatlar',
  kafel: 'Kafel',
  'tayyor-mahsulot': 'Tayyor mahsulot',
  qoshimcha: 'Qo‘shimcha',
  xomashyo: 'Xomashyo',
  sokl: 'Sokl',
  zinapoyalar: 'Zinapoyalar',
  'pol-plitalari': 'Pol uchun plitalar',
  buyurtma: 'Buyurtma asosida',
};

export const categoryName = (id, lang = 'uz') => {
  if (lang && lang !== 'uz') {
    return getLocalizedCategoryName(id, lang);
  }
  return categoryLabels[id] ?? categories.find((item) => item.id === id)?.name ?? id;
};
