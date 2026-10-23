export function orderWeight(products, items) {
  let kilograms = 0;
  let missing = 0;
  for (const item of items) {
    const product = products.find((entry) => String(entry.id) === String(item.productId));
    const quantity = Number(item.quantity);
    const unitWeight = product?.unit === 'kg' ? 1 : product?.unit === 'tonna' ? 1000 : Number(product?.weightKg);
    if (!product || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitWeight) || unitWeight <= 0 || !Number.isFinite(quantity * unitWeight)) { missing += 1; continue; }
    kilograms += quantity * unitWeight;
  }
  return { kilograms: Number.isFinite(kilograms) ? kilograms : null, complete: items.length > 0 && missing === 0 && Number.isFinite(kilograms), missing };
}

export function formatOrderWeight(kilograms) {
  if (!Number.isFinite(kilograms) || kilograms < 0) return '—';
  return kilograms >= 1000
    ? `${(kilograms / 1000).toLocaleString('uz-UZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t`
    : `${kilograms.toLocaleString('uz-UZ', { maximumFractionDigits: 2 })} kg`;
}
