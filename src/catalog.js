const codePattern = /^[A-Z0-9._-]{1,40}$/;
export const productCategories = ["Granit", "Marmar", "Tayyor mahsulot", "Xomashyo", "Qo‘shimcha"];
const isAmount = (value) => Number.isFinite(value) && value >= 0;
const canonicalCode = (value) => typeof value === "string" && /^[A-Za-z0-9._-]{1,40}$/.test(value.trim())
  ? value.trim().toUpperCase() : "";
const isProduct = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function firstUnusedCode(reserved) {
  let sequence = 1;
  while (reserved.has(`STX-${String(sequence).padStart(4, "0")}`)) sequence += 1;
  return `STX-${String(sequence).padStart(4, "0")}`;
}

export function nextProductCode(products = []) {
  const reserved = new Set((Array.isArray(products) ? products : [])
    .map((product) => canonicalCode(product?.code))
    .filter((code) => codePattern.test(code)));
  return firstUnusedCode(reserved);
}

export function normalizeCatalogProducts(products = []) {
  if (!Array.isArray(products)) return [];
  // Reserve every existing code first, so an earlier legacy row cannot take it.
  const reserved = new Set(products.map((product) => canonicalCode(product?.code)).filter((code) => codePattern.test(code)));
  const assigned = new Set();

  return products.map((product) => {
    if (!isProduct(product)) return product;
    let code = canonicalCode(product.code);
    if (!codePattern.test(code) || assigned.has(code)) {
      code = firstUnusedCode(reserved);
      reserved.add(code);
    }
    assigned.add(code);
    const minimumStock = isAmount(product.minimumStock) && (product.unit !== "dona" || Number.isInteger(product.minimumStock))
      ? product.minimumStock : 0;
    const salePrice = isAmount(product.salePrice) ? product.salePrice : isAmount(product.price) ? product.price : 0;
    return { ...product, category: product.category === "Kafel" ? "Tayyor mahsulot" : product.category, code, minimumStock, salePrice };
  });
}

function amount(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || !value.trim()) return NaN;
  return Number(value);
}

export function prepareProduct(draft, products = [], editingId = null) {
  if (!isProduct(draft) || !Array.isArray(products)) return { error: "Mahsulot ma'lumotlari noto'g'ri." };
  const editing = editingId !== null && editingId !== undefined;
  const existing = editing ? products.find((product) => product?.id === editingId) : null;
  if (editing && !existing) return { error: "Tahrirlanadigan mahsulot topilmadi." };

  const product = { ...existing, ...Object.fromEntries(Object.entries(draft).filter(([, value]) => value !== undefined)) };
  if (editing) product.id = existing.id;
  if (!(typeof product.id === "string" && product.id.trim()) && !(typeof product.id === "number" && Number.isFinite(product.id))) {
    return { error: "Mahsulotning ichki ID raqami kiritilmagan." };
  }
  if (!editing && products.some((item) => item?.id === product.id)) return { error: "Bu ichki ID raqami allaqachon mavjud." };
  for (const field of ["name", "category", "unit"]) {
    if (typeof product[field] !== "string" || !product[field].trim()) return { error: "Mahsulot nomi, turi va o'lchov birligini kiriting." };
    product[field] = product[field].trim();
  }

  product.code = product.code === undefined ? nextProductCode(products) : canonicalCode(product.code);
  if (!codePattern.test(product.code)) return { error: "ID raqami 1–40 ta lotin harfi, raqam, nuqta, pastki chiziq yoki chiziqdan iborat bo'lishi kerak." };
  if (products.some((item) => (!editing || item?.id !== editingId) && canonicalCode(item?.code) === product.code)) {
    return { error: "Bu ID raqami boshqa mahsulotga biriktirilgan." };
  }

  product.quantity = amount(product.quantity);
  if (['kg', 'tonna'].includes(product.unit)) {
    delete product.weightKg;
  } else if (product.weightKg !== undefined) {
    product.weightKg = amount(product.weightKg);
    if (!Number.isFinite(product.weightKg) || product.weightKg <= 0) return { error: 'Bir birlik og‘irligini kg da, noldan katta son bilan kiriting.' };
  }
  product.price = amount(product.price);
  product.salePrice = amount(product.salePrice === undefined ? product.price : product.salePrice);
  product.minimumStock = amount(product.minimumStock === undefined ? 0 : product.minimumStock);
  product.stockReference = amount(product.stockReference === undefined ? product.quantity : product.stockReference);
  if (![product.quantity, product.price, product.salePrice, product.minimumStock, product.stockReference].every(isAmount)) {
    return { error: "Miqdor, minimal qoldiq, zaxira va narxlar manfiy bo'lmagan son bo'lishi kerak." };
  }
  if (product.unit === "dona" && (!Number.isInteger(product.quantity) || !Number.isInteger(product.minimumStock))) {
    return { error: "Dona miqdori va minimal qoldiq butun son bo'lishi kerak." };
  }
  if (product.quantity > 0 && product.stockReference === 0) return { error: "Mahsulot qoldig'i bor bo'lsa, to'liq zaxira noldan katta bo'lishi kerak." };
  if (!Number.isFinite(product.quantity * product.price) || !Number.isFinite(product.quantity * product.salePrice)) {
    return { error: "Mahsulotning umumiy qiymati juda katta." };
  }
  return { product };
}
