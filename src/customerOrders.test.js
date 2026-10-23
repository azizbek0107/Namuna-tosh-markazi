import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCustomerOrder } from './customerOrders.js';

const inventory = { products: [{ id: 'p1', name: 'Tosh', quantity: 10, price: 100, unit: 'dona' }], sales: [], operations: [] };
const actor = { id: 'c1', name: 'Kassir', role: 'cashier' };
const draft = { firstName: 'Ali', lastName: 'Valiyev', phone: '+998901234567', relativeFirstName: 'Vali', relativeLastName: 'Valiyev', relativePhone: '+998911234567', orderDate: '2026-10-25', deliveryDate: '2026-10-26', deliveryTime: '14:30', paymentMethod: 'debt', items: [{ productId: 'p1', quantity: '2', price: '150' }] };
test('order retains contacts, date and product prices without changing stock or sales', () => {
  const before = structuredClone(inventory);
  const result = prepareCustomerOrder(inventory, draft, actor, 'o1', '2026-10-22T10:00:00Z');
  assert.equal(result.order.total, 300);
  assert.equal(result.order.phone, draft.phone);
  assert.equal(result.order.relativeLastName, draft.relativeLastName);
  assert.equal(result.order.orderDate, '2026-10-22');
  assert.equal(result.order.orderTime, '15:00');
  assert.equal(result.order.acceptedAt, '2026-10-22T10:00:00.000Z');
  assert.equal(result.order.items[0].productName, 'Tosh');
  assert.equal(result.order.cashierId, actor.id);
  assert.equal(result.order.paymentMethod, 'debt');
  assert.deepEqual(inventory, before);
});

test('cashier cash order requires only customer name and phone and omits hidden contacts', () => {
  const cash = { ...draft, paymentMethod: 'cash', firstName: '  Ali  ', lastName: '', relativeFirstName: '', relativeLastName: '', relativePhone: '' };
  const before = structuredClone(inventory);
  const prepare = (change = {}) => prepareCustomerOrder(inventory, { ...cash, ...change }, actor, 'cash1', '2026-10-22T10:00:00Z');
  const result = prepare();
  assert.equal(result.order.firstName, 'Ali');
  assert.equal(result.order.phone, cash.phone);
  assert.equal(result.order.paymentMethod, 'cash');
  assert.equal(result.order.items[0].customer, 'Ali');
  assert.equal(result.order.total, 300);
  for (const key of ['lastName', 'relativeFirstName', 'relativeLastName', 'relativePhone']) assert.equal(result.order[key], '');
  assert.deepEqual(inventory, before);
  for (const change of [{ firstName: '' }, { phone: '' }, { phone: '123' }, { items: [] }, { items: [{ productId: 'p1', quantity: '11', price: '150' }] }, { paymentMethod: 'invalid' }]) assert.ok(prepare(change).error);
  assert.equal(prepare({ paymentMethod: undefined }).order.paymentMethod, 'cash');
  const switched = prepare({ lastName: 'Old surname', relativeFirstName: 'Old name', relativeLastName: 'Old surname', relativePhone: 'invalid' });
  for (const key of ['lastName', 'relativeFirstName', 'relativeLastName', 'relativePhone']) assert.equal(switched.order[key], '');
});

test('debt, card and admin orders retain full contact requirements', () => {
  for (const paymentMethod of ['debt', 'card']) {
    for (const key of ['firstName', 'lastName', 'phone', 'relativeFirstName', 'relativeLastName', 'relativePhone']) {
      assert.ok(prepareCustomerOrder(inventory, { ...draft, paymentMethod, [key]: '' }, actor, 'o1', '2026-10-22T10:00:00Z').error);
    }
  }
  const admin = { ...actor, role: 'admin' };
  assert.ok(prepareCustomerOrder(inventory, { ...draft, paymentMethod: 'cash', relativePhone: '' }, admin, 'o1', '2026-10-22T10:00:00Z').error);
  const result = prepareCustomerOrder(inventory, { ...draft, paymentMethod: 'cash' }, admin, 'o1', '2026-10-22T10:00:00Z');
  assert.equal(result.order.relativePhone, draft.relativePhone);
});
test('invalid contacts, empty cart, stock overflow and unauthorized role are rejected', () => {
  for (const change of [{ firstName: '' }, { relativePhone: '123' }, { items: [] }, { items: [{ productId: 'p1', quantity: '11', price: '150' }] }]) {
    assert.ok(prepareCustomerOrder(inventory, { ...draft, ...change }, actor, 'o1', '2026-10-22T10:00:00Z').error);
  }
  assert.ok(prepareCustomerOrder(inventory, draft, { ...actor, role: 'worker' }, 'o1', '2026-10-22T10:00:00Z').error);
});
test('service name and price are required only when included and added to total', () => {
  const prepare = (fields) => prepareCustomerOrder(inventory, { ...draft, ...fields }, actor, 'o1', '2026-10-22T10:00:00Z');
  assert.ok(prepare({ includeService: true }).error);
  assert.ok(prepare({ includeService: true, serviceName: 'Yetkazish', servicePrice: '-1' }).error);
  const result = prepare({ includeService: true, serviceName: 'Yetkazish', servicePrice: '50' });
  assert.equal(result.order.total, 350);
  assert.equal(result.order.serviceName, 'Yetkazish');
  assert.equal(prepare({ includeService: false, servicePrice: '50' }).order.total, 300);
});

test('cashier order phones are normalized before storage for every payment method', () => {
  const before = structuredClone(inventory);
  for (const paymentMethod of ['cash', 'debt', 'card']) {
    const result = prepareCustomerOrder(inventory, {
      ...draft, paymentMethod, phone: '90 123 45 67', relativePhone: '+998 (91) 123-45-67',
    }, actor, 'o1', '2026-10-22T10:00:00Z');
    assert.equal(result.error, undefined, paymentMethod);
    assert.equal(result.order.phone, '+998901234567', paymentMethod);
    assert.equal(result.order.relativePhone, paymentMethod === 'cash' ? '' : '+998911234567', paymentMethod);
    assert.equal(result.order.paymentMethod, paymentMethod);
  }
  assert.deepEqual(inventory, before);
});

test('cashier confirmation rejects incomplete, overlong and foreign customer phones', () => {
  for (const paymentMethod of ['cash', 'debt', 'card']) {
    for (const phone of ['90123456', '+99890123456', '9012345678', '+9989012345678', '+7 901234567', '90 abc 1234567']) {
      const result = prepareCustomerOrder(inventory, { ...draft, paymentMethod, phone }, actor, 'o1', '2026-10-22T10:00:00Z');
      assert.ok(result.error, `${paymentMethod}: ${phone}`);
      assert.equal(result.order, undefined);
    }
  }
});

test('cashier debt and card require a complete relative phone while cash ignores it', () => {
  for (const relativePhone of ['', '91123456', '+99891123456', '+9989112345678', '+7 911234567']) {
    for (const paymentMethod of ['debt', 'card']) {
      assert.ok(prepareCustomerOrder(inventory, { ...draft, paymentMethod, relativePhone }, actor, 'o1', '2026-10-22T10:00:00Z').error, `${paymentMethod}: ${relativePhone}`);
    }
    const cash = prepareCustomerOrder(inventory, { ...draft, paymentMethod: 'cash', relativePhone }, actor, 'o1', '2026-10-22T10:00:00Z');
    assert.equal(cash.error, undefined, relativePhone);
    assert.equal(cash.order.relativePhone, '');
  }
});

test('admin order phones retain the existing generic phone format and requirements', () => {
  const admin = { ...actor, role: 'admin' };
  for (const paymentMethod of ['cash', 'debt', 'card']) {
    const result = prepareCustomerOrder(inventory, { ...draft, paymentMethod, phone: '+7 (900) 123-45-67', relativePhone: '1234567' }, admin, 'o1', '2026-10-22T10:00:00Z');
    assert.equal(result.error, undefined, paymentMethod);
    assert.equal(result.order.phone, '+7 (900) 123-45-67');
    assert.equal(result.order.relativePhone, '1234567');
  }
  for (const change of [{ phone: '123456' }, { relativePhone: 'abc1234567' }]) {
    assert.ok(prepareCustomerOrder(inventory, { ...draft, ...change }, admin, 'o1', '2026-10-22T10:00:00Z').error);
  }
});

test('cashier orders retain acceptance day and delivery schedule in Tashkent time', () => {
  const before = structuredClone(inventory);
  for (const paymentMethod of ['cash', 'debt', 'card']) {
    const result = prepareCustomerOrder(inventory, { ...draft, paymentMethod }, actor, 'o1', '2026-10-22T10:00:00Z');
    assert.equal(result.error, undefined, paymentMethod);
    assert.equal(result.order.orderDate, '2026-10-22');
    assert.equal(result.order.orderTime, '15:00');
    assert.equal(result.order.acceptedAt, '2026-10-22T10:00:00.000Z');
    assert.equal(result.order.deliveryDate, '2026-10-26');
    assert.equal(result.order.deliveryTime, '14:30');
    assert.equal(result.order.deliveryAt, '2026-10-26T09:30:00.000Z');
  }
  assert.deepEqual(inventory, before);
});

test('cashier delivery date is required, must exist and cannot precede acceptance day', () => {
  const before = structuredClone(inventory);
  for (const deliveryDate of [undefined, null, '', 'invalid', '2026/10/26', '2026-10-6', '2026-13-01', '2026-11-31', '2027-02-29', '2026-10-21']) {
    const result = prepareCustomerOrder(inventory, { ...draft, deliveryDate }, actor, 'o1', '2026-10-22T10:00:00Z');
    assert.ok(result.error, String(deliveryDate));
    assert.equal(result.order, undefined);
  }
  assert.deepEqual(inventory, before);
});

test('cashier delivery time is required and uses a complete 24 hour HH:mm value', () => {
  const before = structuredClone(inventory);
  for (const deliveryTime of [undefined, null, '', 'invalid', '9:05', '09:5', '14:30:00', '14.30', '24:00', '23:60', '-1:30']) {
    const result = prepareCustomerOrder(inventory, { ...draft, deliveryTime }, actor, 'o1', '2026-10-22T10:00:00Z');
    assert.ok(result.error, String(deliveryTime));
    assert.equal(result.order, undefined);
  }
  assert.deepEqual(inventory, before);
});

test('same day delivery accepts midnight and 23:59 with the correct UTC date boundary', () => {
  for (const [deliveryTime, deliveryAt] of [['00:00', '2026-10-21T19:00:00.000Z'], ['23:59', '2026-10-22T18:59:00.000Z']]) {
    const result = prepareCustomerOrder(inventory, { ...draft, deliveryDate: '2026-10-22', deliveryTime }, actor, 'o1', deliveryAt);
    assert.equal(result.error, undefined, deliveryTime);
    assert.equal(result.order.deliveryDate, '2026-10-22');
    assert.equal(result.order.deliveryTime, deliveryTime);
    assert.equal(result.order.deliveryAt, deliveryAt);
  }
});

test('delivery conversion preserves month, year and leap day boundaries', () => {
  const schedules = [
    ['2026-10-31', '2026-11-01', '01:00', '2026-10-31T20:00:00.000Z'],
    ['2026-12-31', '2027-01-01', '00:00', '2026-12-31T19:00:00.000Z'],
    ['2028-02-28', '2028-02-29', '00:00', '2028-02-28T19:00:00.000Z'],
  ];
  const before = structuredClone(inventory);
  for (const [orderDate, deliveryDate, deliveryTime, deliveryAt] of schedules) {
    const result = prepareCustomerOrder(inventory, { ...draft, orderDate, deliveryDate, deliveryTime }, actor, 'o1', `${orderDate}T10:00:00Z`);
    assert.equal(result.error, undefined, deliveryDate);
    assert.equal(result.order.orderDate, orderDate);
    assert.equal(result.order.deliveryDate, deliveryDate);
    assert.equal(result.order.deliveryAt, deliveryAt);
  }
  assert.deepEqual(inventory, before);
});

test('admin legacy order drafts do not require the new cashier delivery fields', () => {
  const legacy = { ...draft };
  delete legacy.deliveryDate;
  delete legacy.deliveryTime;
  const admin = { ...actor, role: 'admin' };
  const before = structuredClone(inventory);
  for (const paymentMethod of ['cash', 'debt', 'card']) {
    const result = prepareCustomerOrder(inventory, { ...legacy, paymentMethod }, admin, 'o1', '2026-10-22T10:00:00Z');
    assert.equal(result.error, undefined, paymentMethod);
    assert.equal(result.order.orderDate, legacy.orderDate);
    assert.equal(result.order.phone, legacy.phone);
    assert.equal(result.order.total, 300);
  }
  assert.deepEqual(inventory, before);
});

test('cashier acceptance date and time ignore caller dates and preserve the actual timestamp', () => {
  const before = structuredClone(inventory);
  const time = '2026-10-22T10:07:56.789Z';
  for (const paymentMethod of ['cash', 'debt', 'card']) {
    for (const orderDate of [undefined, '', 'invalid', '2026-02-30', '2000-01-01', '2099-12-31']) {
      const result = prepareCustomerOrder(inventory, { ...draft, paymentMethod, orderDate, orderTime: '23:59', acceptedAt: '2000-01-01T00:00:00Z' }, actor, 'o1', time);
      assert.equal(result.error, undefined, `${paymentMethod}: ${String(orderDate)}`);
      assert.equal(result.order.orderDate, '2026-10-22');
      assert.equal(result.order.orderTime, '15:07');
      assert.equal(result.order.acceptedAt, time);
    }
  }
  assert.deepEqual(inventory, before);
});

test('cashier acceptance follows Tashkent midnight and year boundaries independently of UTC day', () => {
  const cases = [
    ['2026-10-22T18:59:59.999Z', '2026-10-22', '23:59'],
    ['2026-10-22T19:00:00.000Z', '2026-10-23', '00:00'],
    ['2026-12-31T19:00:00.000Z', '2027-01-01', '00:00'],
  ];
  for (const [time, orderDate, orderTime] of cases) {
    const deliveryDate = new Date(Date.parse(`${orderDate}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
    const result = prepareCustomerOrder(inventory, { ...draft, deliveryDate }, actor, 'o1', time);
    assert.equal(result.error, undefined, time);
    assert.equal(result.order.orderDate, orderDate);
    assert.equal(result.order.orderTime, orderTime);
    assert.equal(result.order.acceptedAt, time);
  }
});

test('invalid trusted acceptance timestamps reject cashier orders without changing inventory', () => {
  const before = structuredClone(inventory);
  for (const time of [undefined, null, '', 'invalid', '2026-13-22T10:00:00Z', '2026-10-22T25:00:00Z', NaN, Infinity]) {
    const result = prepareCustomerOrder(inventory, draft, actor, 'o1', time);
    assert.ok(result.error, String(time));
    assert.equal(result.order, undefined);
  }
  assert.deepEqual(inventory, before);
});

test('cashier delivery comparison uses the trusted Tashkent acceptance day', () => {
  const time = '2026-10-22T19:00:00.000Z';
  const earlier = prepareCustomerOrder(inventory, { ...draft, orderDate: '2000-01-01', deliveryDate: '2026-10-22' }, actor, 'o1', time);
  assert.ok(earlier.error);
  const sameDay = prepareCustomerOrder(inventory, { ...draft, orderDate: '2099-12-31', deliveryDate: '2026-10-23', deliveryTime: '00:00' }, actor, 'o1', time);
  assert.equal(sameDay.error, undefined);
  assert.equal(sameDay.order.orderDate, '2026-10-23');
  assert.equal(sameDay.order.deliveryAt, time);
});

test('admin acceptance retains explicit dates and still rejects invalid caller dates', () => {
  const admin = { ...actor, role: 'admin' };
  const result = prepareCustomerOrder(inventory, { ...draft, orderDate: '2026-10-25' }, admin, 'o1', '2026-10-22T19:00:00.000Z');
  assert.equal(result.error, undefined);
  assert.equal(result.order.orderDate, '2026-10-25');
  for (const orderDate of [undefined, '', 'invalid', '2026-02-30']) {
    assert.ok(prepareCustomerOrder(inventory, { ...draft, orderDate }, admin, 'o1', '2026-10-22T10:00:00Z').error, String(orderDate));
  }
});

test('cashier delivery cannot precede the trusted acceptance instant for any payment method', () => {
  const before = structuredClone(inventory);
  const pastCases = [
    ['2026-10-22T10:00:00.000Z', '2026-10-22', '14:59'],
    ['2026-10-22T10:00:00.001Z', '2026-10-22', '15:00'],
    ['2026-10-22T10:00:59.999Z', '2026-10-22', '15:00'],
    ['2026-10-22T19:00:00.000Z', '2026-10-22', '23:59'],
  ];
  for (const paymentMethod of ['cash', 'debt', 'card']) {
    for (const [time, deliveryDate, deliveryTime] of pastCases) {
      const result = prepareCustomerOrder(inventory, { ...draft, paymentMethod, deliveryDate, deliveryTime }, actor, 'o1', time);
      assert.ok(result.error, `${paymentMethod}: ${time} / ${deliveryDate} ${deliveryTime}`);
      assert.equal(result.order, undefined);
    }
  }
  assert.deepEqual(inventory, before);
});

test('cashier delivery accepts the exact acceptance instant and future minutes across Tashkent midnight', () => {
  const before = structuredClone(inventory);
  const cases = [
    ['2026-10-22T10:00:00.000Z', '2026-10-22', '15:00', '2026-10-22T10:00:00.000Z'],
    ['2026-10-22T10:00:59.999Z', '2026-10-22', '15:01', '2026-10-22T10:01:00.000Z'],
    ['2026-10-22T18:59:59.999Z', '2026-10-23', '00:00', '2026-10-22T19:00:00.000Z'],
    ['2026-10-22T19:00:00.000Z', '2026-10-23', '00:00', '2026-10-22T19:00:00.000Z'],
  ];
  for (const paymentMethod of ['cash', 'debt', 'card']) {
    for (const [time, deliveryDate, deliveryTime, deliveryAt] of cases) {
      const result = prepareCustomerOrder(inventory, { ...draft, paymentMethod, deliveryDate, deliveryTime }, actor, 'o1', time);
      assert.equal(result.error, undefined, `${paymentMethod}: ${time} / ${deliveryTime}`);
      assert.equal(result.order.deliveryAt, deliveryAt);
      assert.equal(result.order.acceptedAt, time);
    }
  }
  assert.deepEqual(inventory, before);
});

test('admin legacy orders remain independent of the new cashier past-delivery restriction', () => {
  const admin = { ...actor, role: 'admin' };
  const before = structuredClone(inventory);
  for (const paymentMethod of ['cash', 'debt', 'card']) {
    const result = prepareCustomerOrder(inventory, { ...draft, paymentMethod, deliveryDate: '2026-10-21', deliveryTime: '00:00' }, admin, 'o1', '2026-10-22T10:00:00.000Z');
    assert.equal(result.error, undefined, paymentMethod);
    assert.equal(result.order.orderDate, draft.orderDate);
  }
  assert.deepEqual(inventory, before);
});
