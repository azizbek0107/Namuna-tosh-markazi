const roundQuantity = (quantity) => quantity <= Number.MAX_VALUE / 1e9
  ? Math.round(quantity * 1e9) / 1e9
  : quantity;

const compareText = (first, second) => first.localeCompare(second, "uz") || (first < second ? -1 : first > second ? 1 : 0);

function saleTimestamp(value) {
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) return NaN;
  return Date.parse(value);
}

export function getProductSales(sales, start, end) {
  if (!Array.isArray(sales) || !Number.isFinite(start) || !Number.isFinite(end) || start >= end) return [];

  const totals = new Map();
  for (const sale of sales) {
    if (!sale || typeof sale !== "object" || Array.isArray(sale)) continue;
    if (!Number.isFinite(sale.quantity) || sale.quantity <= 0 || typeof sale.productName !== "string") continue;
    const name = sale.productName.trim();
    const time = saleTimestamp(sale.time);
    if (!name || !(time >= start && time < end)) continue;

    const unit = typeof sale.unit === "string" ? sale.unit : "";
    const hasProductId = typeof sale.productId === "string"
      ? sale.productId.trim() !== ""
      : typeof sale.productId === "number" && Number.isFinite(sale.productId);
    const key = JSON.stringify(hasProductId ? [sale.productId, unit] : ["legacy", name, unit]);
    const previous = totals.get(key);
    const sum = (previous?.quantity ?? 0) + sale.quantity;
    const quantity = Number.isFinite(sum) ? roundQuantity(sum) : Number.MAX_VALUE;
    const useName = !previous || time > previous.time || (time === previous.time && compareText(name, previous.name) < 0);

    totals.set(key, { key, name: useName ? name : previous.name, unit, quantity, time: useName ? time : previous.time });
  }

  return [...totals.values()]
    .sort((first, second) => compareText(first.unit, second.unit)
      || second.quantity - first.quantity
      || compareText(first.name, second.name)
      || compareText(first.key, second.key))
    .map(({ key, name, unit, quantity }) => ({ key, name, unit, quantity }));
}
