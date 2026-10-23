import { normalizeUzPhone } from './uzbekPhone.js';

export function recordSale(inventory, draft, id, time, actor) {
  if (actor && !["admin", "cashier"].includes(actor.role)) return { error: "Sotuv uchun ruxsat yo‘q." };
  const product = inventory.products.find((item) => String(item.id) === String(draft.productId));
  const quantity = Number(draft.quantity);
  const price = Number(draft.price);
  if (!product) return { error: "Mahsulotni tanlang." };
  if (!String(draft.quantity).trim() || !Number.isFinite(quantity) || quantity <= 0) return { error: "Miqdor noldan katta bo‘lishi kerak." };
  if (!String(draft.price).trim() || !Number.isFinite(price) || price < 0 || !Number.isFinite(quantity * price)) return { error: "Narxni to‘g‘ri kiriting." };
  if (quantity > product.quantity) return { error: `Omborda faqat ${product.quantity} ${product.unit} mavjud.` };
  if (product.unit === "dona" && !Number.isInteger(quantity)) return { error: "Dona bilan sotiladigan mahsulot miqdori butun son bo‘lishi kerak." };
  const paymentMethod = draft.paymentMethod ?? "cash";
  if (!["cash", "card", "debt"].includes(paymentMethod)) return { error: "To‘lov turini tanlang." };
  if (paymentMethod === "debt" && !String(draft.customer ?? "").trim()) return { error: "Qarz uchun mijoz ismini kiriting." };
  const sale = {
    id, time, productId: product.id, productName: product.name, unit: product.unit,
    quantity, price, amount: Math.round(quantity * price * 100) / 100,
    costAmount: Math.round(quantity * Number(product.price ?? 0) * 100) / 100,
    customer: String(draft.customer || "").trim().slice(0, 150) || "Chakana xaridor",
    ...(normalizeUzPhone(draft.customerPhone ?? draft.phone) ? { customerPhone: normalizeUzPhone(draft.customerPhone ?? draft.phone) } : {}),
    paymentMethod, cashierId: actor?.id ?? null, cashierName: actor?.name ?? "Noma’lum",
    shiftId: draft.shiftId ?? null,
    ...(paymentMethod === 'debt' && draft.debtDate ? { debtDate: draft.debtDate, debtDueDate: draft.debtDueDate } : {}),
    transactionId: draft.transactionId ?? null,
  };
  return { inventory: {
    ...inventory,
    products: inventory.products.map((item) => item.id === product.id
      ? { ...item, quantity: Math.round((item.quantity - quantity) * 1e9) / 1e9 } : item),
    sales: [sale, ...(inventory.sales ?? [])],
    operations: [{ id, time, name: product.name, action: `Sotildi: ${quantity} ${product.unit}` }, ...inventory.operations],
  } };
}

export function recordCart(inventory, draft, id, time, actor) {
  if (actor?.role === 'cashier' && draft.paymentMethod === 'debt' && draft.debtDate) {
    const start = Date.parse(`${draft.debtDate}T00:00:00Z`);
    const due = Date.parse(`${draft.debtDueDate}T00:00:00Z`);
    if (!Number.isFinite(start) || !Number.isFinite(due) || due < start || due - start > 45 * 86400000) return { error: 'Qarz muddati 45 kundan oshmasligi kerak.' };
  }
  if (!Array.isArray(draft.items) || draft.items.length === 0) return { error: "Savatga mahsulot qo‘shing." };
  let next = inventory, total = 0;
  for (const [index, item] of draft.items.entries()) {
    if (!item || typeof item !== "object") return { error: "Savatdagi mahsulot noto‘g‘ri." };
    const result = recordSale(next, { productId: item.productId, quantity: item.quantity, price: item.price, customer: draft.customer, customerPhone: draft.customerPhone ?? draft.phone, paymentMethod: draft.paymentMethod, debtDate: draft.debtDate, debtDueDate: draft.debtDueDate, shiftId: draft.shiftId, transactionId: id }, `${id}-${index + 1}`, time, actor);
    if (result.error) return { error: result.error };
    next = result.inventory;
    total += next.sales[0].amount;
    if (!Number.isFinite(total)) return { error: "Savat summasi juda katta." };
  }
  if (actor?.role === 'cashier' && draft.paymentMethod === 'debt' && total > 100000 && !normalizeUzPhone(draft.customerPhone ?? draft.phone)) return { error: '100 000 so‘mdan ortiq qarz uchun xaridorning to‘liq telefon raqamini kiriting.' };
  return { inventory: next };
}

export const paymentNames = { cash: "Naqd", card: "Karta", debt: "Qarz", unknown: "Belgilanmagan" };
export const paymentOf = (sale) => sale.paymentMethod ?? "unknown";
export function cancelSale(inventory, id, reason, actor, time) {
  if (actor?.role !== "admin") return { error: "Faqat admin operatsiyani bekor qila oladi." };
  if (!String(reason ?? "").trim()) return { error: "Bekor qilish sababini kiriting." };
  const sale = inventory.sales.find((item) => item.id === id);
  if (!sale || sale.cancelledAt) return { error: "Sotuv topilmadi yoki allaqachon bekor qilingan." };
  if (!inventory.products.some((item) => item.id === sale.productId)) return { error: "Mahsulot o‘chirilgan. Avval mahsulotni tiklang." };
  return { inventory: { ...inventory,
    products: inventory.products.map((item) => item.id === sale.productId ? { ...item, quantity: Math.round((item.quantity + sale.quantity) * 1e9) / 1e9 } : item),
    sales: inventory.sales.map((item) => item.id === id ? { ...item, cancelledAt: time, cancelledBy: actor.name, cancelReason: reason.trim() } : item),
    operations: [{ id: `${id}-cancel`, time, name: sale.productName, action: `Sotuv bekor qilindi: ${reason.trim()} · ${actor.name}` }, ...inventory.operations],
  } };
}
