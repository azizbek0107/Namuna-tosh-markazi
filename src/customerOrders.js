import { recordCart } from './sales.js';
import { orderWeight } from './orderWeight.js';
import { validDay } from './attendance.js';
import { normalizeUzPhone } from './uzbekPhone.js';
import { getDeliveryTimeError } from './uzbekDate.js';

export function prepareCustomerOrder(inventory, draft, actor, id, time) {
  const paymentMethod = draft.paymentMethod ?? 'cash';
  const basicContacts = actor?.role === 'cashier' && paymentMethod === 'cash';
  const details = {};
  for (const key of ['firstName', 'lastName', 'relativeFirstName', 'relativeLastName']) {
    const required = key === 'firstName' || !basicContacts;
    details[key] = required ? String(draft[key] ?? '').trim() : '';
    if (required && (!details[key] || details[key].length > 100)) return { error: basicContacts ? 'Mijozning ismini kiriting.' : 'Mijoz va yaqin qarindoshining ism-familiyasini kiriting.' };
  }
  for (const key of ['phone', 'relativePhone']) {
    if (basicContacts && key === 'relativePhone') { details[key] = ''; continue; }
    details[key] = String(draft[key] ?? '').trim();
    if (actor?.role === 'cashier') {
      const phone = normalizeUzPhone(details[key]);
      if (!phone) return { error: 'Telefon raqamini to‘liq kiriting: +998 90 123 45 56.' };
      details[key] = phone;
    } else if (!/^\+?[\d\s()-]{7,25}$/.test(details[key]) || details[key].replace(/\D/g, '').length < 7) return { error: 'Telefon raqamlarini to‘g‘ri kiriting.' };
  }
  let orderDate = draft.orderDate;
  if (actor?.role === 'cashier') {
    const acceptedTime = typeof time === 'string' ? Date.parse(time) : NaN;
    if (!Number.isFinite(acceptedTime)) return { error: 'Qabul qilingan sana va vaqtni aniqlab bo‘lmadi.' };
    const localDateTime = new Date(acceptedTime + 5 * 3600000).toISOString();
    orderDate = localDateTime.slice(0, 10);
    details.orderTime = localDateTime.slice(11, 16);
    details.acceptedAt = new Date(acceptedTime).toISOString();
  }
  if (!validDay(orderDate)) return { error: 'Buyurtma kunini belgilang.' };
  if (actor?.role === 'cashier') {
    details.deliveryDate = String(draft.deliveryDate ?? '').trim();
    details.deliveryTime = String(draft.deliveryTime ?? '').trim();
    if (!validDay(details.deliveryDate)) return { error: 'Yetkazib berish sanasini kiriting.' };
    if (details.deliveryDate < orderDate) return { error: 'Yetkazib berish sanasi qabul qilingan kundan oldin bo‘lishi mumkin emas.' };
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(details.deliveryTime)) return { error: 'Yetkazib berish vaqtini kiriting (soat:daqiqa).' };
    const deliveryError = getDeliveryTimeError(details.deliveryDate, details.deliveryTime, Date.parse(details.acceptedAt));
    if (deliveryError) return { error: deliveryError };
    details.deliveryAt = new Date(`${details.deliveryDate}T${details.deliveryTime}:00+05:00`).toISOString();
  }
  details.includeService = draft.includeService === true;
  details.serviceName = details.includeService ? String(draft.serviceName ?? '').trim() : '';
  details.servicePrice = details.includeService ? Number(draft.servicePrice) : 0;
  if (details.includeService && (!details.serviceName || details.serviceName.length > 150 || !String(draft.servicePrice ?? '').trim() || !Number.isFinite(details.servicePrice) || details.servicePrice < 0 || details.servicePrice > 1e12)) return { error: 'Xizmat nomi va to‘g‘ri narxini kiriting.' };
  details.servicePrice = Math.round(details.servicePrice * 100) / 100;
  const result = recordCart(inventory, { ...draft, paymentMethod, customer: [details.firstName, details.lastName].filter(Boolean).join(' ') }, id, time, actor);
  if (result.error) return { error: result.error };
  const lines = result.inventory.sales.filter((sale) => sale.transactionId === id);
  const weight = orderWeight(inventory.products, draft.items);
  if (actor?.role === 'cashier') details.totalWeightKg = weight.complete ? weight.kilograms : null;
  return { order: { id, time, ...details, paymentMethod, orderDate, cashierId: actor.id, cashierName: actor.name, status: 'Yangi', items: lines, total: Math.round((lines.reduce((sum, line) => sum + line.amount, 0) + details.servicePrice) * 100) / 100 } };
}
