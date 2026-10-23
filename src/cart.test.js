import test from "node:test";
import assert from "node:assert/strict";
import { recordCart } from "./sales.js";
const actor = { id: "cashier", name: "Kassir", role: "cashier" };
const inventory = () => ({ products: [{ id: "a", name: "Granit", quantity: 5, unit: "dona", price: 10 }, { id: "b", name: "Marmar", quantity: 2.5, unit: "m²", price: 20 }], sales: [], operations: [] });
const draft = { customer: "Ali", paymentMethod: "card", shiftId: "shift", items: [{ productId: "a", quantity: "2", price: "100" }, { productId: "b", quantity: "0.5", price: "200" }] };
test("cart saves all lines with one transaction and updates stock and payment correctly", () => {
  const original = inventory();
  const result = recordCart(original, draft, "transaction", "2026-10-21T08:00:00Z", actor).inventory;
  assert.deepEqual(result.products.map((p) => p.quantity), [3, 2]);
  assert.equal(result.sales.reduce((sum, row) => sum + row.amount, 0), 300);
  assert.equal(new Set(result.sales.map((row) => row.id)).size, 2);
  assert.ok(result.sales.every((row) => row.transactionId === "transaction" && row.customer === "Ali" && row.paymentMethod === "card" && row.shiftId === "shift" && row.cashierId === "cashier"));
  assert.equal(original.sales.length, 0);
  assert.equal(original.products[0].quantity, 5);
});
test("failure in any line leaves entire inventory intact, including cumulative repeated stock", () => {
  const original = inventory();
  const invalid = recordCart(original, { ...draft, items: [draft.items[0], { ...draft.items[1], quantity: 99 }] }, "id", "now", actor);
  assert.ok(invalid.error); assert.equal(invalid.inventory, undefined);
  assert.deepEqual(original, inventory());
  assert.ok(recordCart(original, { ...draft, items: [{ ...draft.items[0], quantity: 3 }, { ...draft.items[0], quantity: 3 }] }, "id", "now", actor).error);
  assert.ok(recordCart(original, { ...draft, items: [] }, "id", "now", actor).error);
  assert.ok(recordCart(original, { ...draft, items: [null] }, "id", "now", actor).error);
  assert.ok(recordCart(original, { ...draft, customer: "", paymentMethod: "debt" }, "id", "now", actor).error);
});

test('cashier debts above 100000 require a phone and retain it on every line', () => {
  for (const amount of [99999, 100000, 100001]) {
    const order = { ...draft, paymentMethod: 'debt', items: [{ productId: 'a', quantity: '1', price: String(amount) }] };
    const original = inventory();
    const missing = recordCart(original, order, 'id', 'now', actor);
    assert.equal(Boolean(missing.error), amount > 100000);
    assert.deepEqual(original, inventory());
    const saved = recordCart(original, { ...order, customerPhone: '901234567' }, 'id', 'now', actor);
    assert.equal(saved.error, undefined);
    assert.equal(saved.inventory.sales[0].customerPhone, '+998901234567');
    assert.ok(recordCart(original, { ...order, customer: '', customerPhone: '901234567' }, 'id', 'now', actor).error);
    assert.equal(recordCart(original, order, 'id', 'now', { ...actor, role: 'admin' }).error, undefined);
  }
});
