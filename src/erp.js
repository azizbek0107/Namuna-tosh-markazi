export const money = (amount) => amount.toLocaleString("uz-UZ") + " so‘m";
export const dateTime = (time) => new Date(time).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

export function getUsedProducts(orders, start, end) {
  const totals = new Map();
  for (const order of orders) {
    const time = Date.parse(order.completedAt);
    if (order.status !== "Tayyor" || !(time >= start && time < end)) continue;
    const key = JSON.stringify([order.sourceId, order.sourceUnit]);
    const previous = totals.get(key);
    totals.set(key, { key, name: order.sourceName, unit: order.sourceUnit, quantity: Math.round(((previous?.quantity ?? 0) + order.input) * 1e9) / 1e9 });
  }
  return [...totals.values()].sort((a, b) => a.name.localeCompare(b.name, "uz"));
}

export function getProducedProducts(orders, start, end) {
  const totals = new Map();
  for (const order of orders) {
    const time = Date.parse(order.completedAt);
    if (order.status !== "Tayyor" || !(time >= start && time < end)) continue;
    const key = JSON.stringify([order.targetId, order.targetUnit]);
    const previous = totals.get(key);
    totals.set(key, { key, name: order.targetName, unit: order.targetUnit, quantity: Math.round(((previous?.quantity ?? 0) + order.output) * 1e9) / 1e9 });
  }
  return [...totals.values()].sort((a, b) => a.name.localeCompare(b.name, "uz"));
}

export function completeProduction(state, id, time) {
  const order = state.production.find((item) => item.id === id);
  if (!order || order.status === "Tayyor") return { error: "Buyurtma topilmadi yoki allaqachon yakunlangan." };
  const source = state.products.find((item) => item.id === order.sourceId);
  const target = state.products.find((item) => item.id === order.targetId);
  if (!source || !target) return { error: "Buyurtmadagi mahsulot ombordan o‘chirilgan." };
  if (source.quantity < order.input) return { error: "Xomashyo qoldig‘i yetarli emas." };
  if (!Number.isFinite(target.quantity + order.output)) return { error: "Natija miqdori juda katta." };
  const targetQuantity = Math.round((target.quantity + order.output) * 1e9) / 1e9;
  const targetStockReference = Number.isFinite(target.stockReference) && target.stockReference > 0
    ? target.stockReference
    : Math.max(target.quantity, targetQuantity);
  return { state: {
    ...state,
    products: state.products.map((product) => product.id === source.id ? { ...product, quantity: Math.round((product.quantity - order.input) * 1e9) / 1e9 } : product.id === target.id ? { ...product, quantity: targetQuantity, stockReference: targetStockReference } : product),
    production: state.production.map((item) => item.id === id ? { ...item, status: "Tayyor", completedAt: time } : item),
    operations: [{ id: `${id}-complete`, name: order.name, time, action: "Ishlab chiqarildi" }, ...state.operations],
  } };
}

export function exportCsv(filename, headers, rows) {
  const cell = (value) => {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const blob = new Blob(["\ufeff" + [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
