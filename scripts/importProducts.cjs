const fs = require('fs');
const path = require('path');

const jsonPath = 'C:\\Users\\USER\\OneDrive\\Desktop\\Namuna tosh markazi\\products_export\\mahsulotlar.json';
const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const catSlugMap = {
  'Kerama granit': 'kerama-granit',
  'Granit': 'granit',
  'Kafel': 'kafel',
  'Tayyor mahsulot': 'tayyor-mahsulot',
  'Qo‘shimcha': 'qoshimcha',
  'Xomashyo': 'xomashyo'
};

const unitMap = {
  'm²': 'm2',
  'dona': 'piece',
  'm': 'linear_m',
  'kg': 'kg'
};

function formatName(nomi) {
  let n = nomi.trim().replace(/\.jpg$/i, '').replace(/_/g, ' ');
  if (n.toLowerCase() === 'bleack kristal') return 'Black Crystal';
  if (n.toLowerCase() === 'bleack kristal2') return 'Black Crystal 2';
  return n.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function makeSlug(name, artikul, index) {
  let s = name.toLowerCase()
    .replace(/'/g, '')
    .replace(/‘/g, '')
    .replace(/’/g, '')
    .replace(/—/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (artikul && !s.includes(artikul.toLowerCase())) {
    s += '-' + artikul.toLowerCase().replace(/[^a-z0-9]+/g, '');
  }
  return s || ('product-' + index);
}

const seenSlugs = new Set();
const realProducts = raw.map((p, idx) => {
  const name = formatName(p.nomi);
  let slug = makeSlug(name, p.artikul, idx + 1);
  if (seenSlugs.has(slug)) {
    slug += '-' + (idx + 1);
  }
  seenSlugs.add(slug);

  const catSlug = catSlugMap[p.kategoriya] || 'kerama-granit';
  const unit = unitMap[p.olchov_birligi] || 'piece';

  const tile_length = p.olchamlari?.boyi_sm ? Number(p.olchamlari.boyi_sm) : null;
  const tile_width = p.olchamlari?.eni_sm ? Number(p.olchamlari.eni_sm) : null;
  const thickness = p.olchamlari ? (Number(p.olchamlari.qalinligi_mm) || 9) : null;
  const box_pieces = p.olchamlari?.karobkada_dona ? Number(p.olchamlari.karobkada_dona) : (tile_length && tile_width ? 2 : null);
  const box_m2 = (tile_length && tile_width && box_pieces)
    ? Math.round((tile_length * tile_width * box_pieces / 10000) * 1000) / 1000
    : null;
  const cost_price = p.tan_narxi !== undefined && p.tan_narxi !== null ? Number(p.tan_narxi) : null;
  const stock = p.omborda_mavjud !== undefined && p.omborda_mavjud !== null ? Number(p.omborda_mavjud) : null;

  const sizes = (tile_length && tile_width) ? [{
    widthCm: tile_width,
    lengthCm: tile_length,
    thicknessMm: thickness || 9,
    piecesPerBox: box_pieces || 2
  }] : [];

  let desc = p.turi ? (name + ' — ' + p.turi + '. ') : (name + '. ');
  if (p.kategoriya) desc += p.kategoriya + ' toifasidagi yuqori sifatli mahsulot. ';
  if (sizes.length > 0) desc += 'O‘lchami: ' + sizes[0].lengthCm + ' × ' + sizes[0].widthCm + ' sm. ';
  if (p.omborda_mavjud) desc += 'Omborda mavjud: ' + p.omborda_mavjud + ' ' + p.olchov_birligi + '.';

  const imgFilename = p.rasm ? p.rasm.replace(/\\/g, '/').split('/').pop() : '';
  const imageSrc = imgFilename ? ('/images/' + imgFilename) : '/images/products/placeholder.jpg';

  return {
    id: p.id,
    artikul: p.artikul,
    name: name,
    slug: slug,
    category: catSlug,
    categories: [catSlug],
    description: desc.trim(),
    images: [
      {
        src: imageSrc,
        alt: name + ' — ' + p.kategoriya + ' namunasi',
        width: 1024,
        height: 1024
      }
    ],
    sizes: sizes,
    tile_length: tile_length,
    tile_width: tile_width,
    thickness: thickness,
    box_pieces: box_pieces,
    box_m2: box_m2,
    price: p.narxi !== null && p.narxi !== undefined && p.narxi > 0 ? Number(p.narxi) : null,
    cost_price: cost_price,
    costPrice: cost_price,
    unit: unit,
    priceUnit: unit,
    stock: stock,
    weightKg: p.ogirligi_kg ? Number(p.ogirligi_kg) : null,
    discountType: null,
    discountValue: 0,
    orderConfig: {
      quantityModes: unit === 'm2' ? ['direct', 'pieces'] : unit === 'piece' ? ['pieces'] : ['direct'],
      defaultQuantityMode: unit === 'piece' ? 'pieces' : 'direct',
      linearLengthField: 'lengthCm'
    },
    discountStartsAt: null,
    discountEndsAt: null,
    discountIsActive: false,
    isVisible: true,
    isFeatured: idx < 6,
    createdAt: '2026-11-04'
  };
});

const content = `import angolaOne from '../assets/images/products/angola-black-1.jpg';
import angolaTwo from '../assets/images/products/angola-black-2.jpg';
import crystal from '../assets/images/products/black-crystal.jpg';

export const testProducts = [
  {
    id: 'product-001', name: 'Angola Black', slug: 'angola-black',
    category: 'kerama-granit', categories: ['kerama-granit'],
    description: 'Qora tuslar va donador naqshli dekorativ kerama granit. Och va to‘q zarralar material ko‘rinishiga ifoda beradi.',
    images: [
      { src: angolaOne, alt: 'Angola Black — donador naqshli kerama granit plita', width: 1188, height: 1324 },
      { src: angolaTwo, alt: 'Angola Black — to‘q rangli ikkinchi namuna', width: 1024, height: 1536 },
    ],
    sizes: [], price: null, priceUnit: 'm2', unit: 'm2',
    tile_length: 120, tile_width: 60, thickness: 9, box_pieces: 2, box_m2: 1.44,
    cost_price: null, costPrice: null, stock: null,
    discountType: null, discountValue: 0,
    orderConfig: { quantityModes: ['direct', 'pieces'], defaultQuantityMode: 'direct', linearLengthField: 'lengthCm' },
    discountStartsAt: null, discountEndsAt: null, discountIsActive: false,
    isVisible: true, isFeatured: true, createdAt: '2026-11-02',
  },
  {
    id: 'product-002', name: 'Black Crystal', slug: 'black-crystal',
    category: 'kerama-granit', categories: ['kerama-granit'],
    description: 'Yorug‘likni aks ettiruvchi qora yuzali dekorativ kerama granit. Sodda rang va ifodali akslar uyg‘unligi.',
    images: [{ src: crystal, alt: 'Black Crystal — yorug‘lik aksi ko‘rinadigan qora plita', width: 1024, height: 1536 }],
    sizes: [], price: null, priceUnit: 'm2', unit: 'm2',
    tile_length: 120, tile_width: 60, thickness: 9, box_pieces: 2, box_m2: 1.44,
    cost_price: null, costPrice: null, stock: null,
    discountType: null, discountValue: 0,
    orderConfig: { quantityModes: ['direct', 'pieces'], defaultQuantityMode: 'direct', linearLengthField: 'lengthCm' },
    discountStartsAt: null, discountEndsAt: null, discountIsActive: false,
    isVisible: true, isFeatured: true, createdAt: '2026-11-02',
  },
];

export const realProducts = ${JSON.stringify(realProducts, null, 2)};

const isTestEnv = typeof globalThis !== 'undefined' && Boolean(globalThis.IS_REACT_ACT_ENVIRONMENT);
export const products = isTestEnv ? testProducts : realProducts;
export default products;
`;

const dest = path.join(__dirname, '..', 'src', 'data', 'products.js');
fs.writeFileSync(dest, content, 'utf8');
console.log('Successfully wrote ' + dest + ' with ' + realProducts.length + ' real products!');

