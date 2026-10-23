import { test } from "node:test";
import assert from "node:assert/strict";
import { completeProduction, getProducedProducts, getUsedProducts } from "./erp.js";
import { recordSale } from "./sales.js";

test("daily usage counts completed consumption, respects day boundaries and units", () => {
  const start = Date.parse("2026-10-18T19:00:00Z");
  const end = Date.parse("2026-10-19T19:00:00Z");
  const item = { sourceId: "raw", sourceName: "Granit", sourceUnit: "m²", input: 0.1, status: "Tayyor", completedAt: new Date(start).toISOString() };
  const result = getUsedProducts([
    item, { ...item, input: 0.2 },
    { ...item, input: 3, sourceUnit: "kg" },
    { ...item, input: 10, status: "Jarayonda" },
    { ...item, input: 20, completedAt: new Date(end).toISOString() },
    { ...item, input: 30, completedAt: new Date(start - 1).toISOString() },
  ], start, end);
  assert.equal(result.length, 2);
  assert.equal(result.find((row) => row.unit === "m²").quantity, 0.3);
  assert.equal(result.find((row) => row.unit === "kg").quantity, 3);
  assert.deepEqual(getUsedProducts([], start, end), []);
});

test("daily production includes only completed output inside the day", () => {
  const start = Date.parse("2026-10-18T19:00:00Z");
  const end = Date.parse("2026-10-19T19:00:00Z");
  const item = { targetId: "ready", targetName: "Plita", targetUnit: "dona", output: 2, status: "Tayyor", completedAt: new Date(start).toISOString() };
  const result = getProducedProducts([
    item,
    { ...item, output: 3, completedAt: new Date(end - 1).toISOString() },
    { ...item, output: 10, status: "Jarayonda" },
    { ...item, output: 20, completedAt: new Date(end).toISOString() },
    { ...item, output: 30, completedAt: new Date(start - 1).toISOString() },
    { ...item, output: 40, completedAt: undefined },
    { ...item, output: 50, completedAt: "invalid" },
  ], start, end);
  assert.deepEqual(result, [{ key: JSON.stringify(["ready", "dona"]), name: "Plita", unit: "dona", quantity: 5 }]);
  assert.deepEqual(getProducedProducts([], start, end), []);
});

test("daily production sums fractional output separately for each product and unit", () => {
  const start = Date.parse("2026-10-18T19:00:00Z");
  const end = Date.parse("2026-10-19T19:00:00Z");
  const item = { targetId: "ready", targetName: "Plita", targetUnit: "m²", output: 0.1, input: 100, status: "Tayyor", completedAt: new Date(start).toISOString() };
  const result = getProducedProducts([
    item,
    { ...item, output: 0.2 },
    { ...item, output: 3, targetUnit: "dona" },
    { ...item, output: 4, targetId: "other" },
  ], start, end);
  assert.equal(result.length, 3);
  assert.equal(result.find((row) => row.key === JSON.stringify(["ready", "m²"])).quantity, 0.3);
  assert.equal(result.find((row) => row.key === JSON.stringify(["ready", "dona"])).quantity, 3);
  assert.equal(result.find((row) => row.key === JSON.stringify(["other", "m²"])).quantity, 4);
});

function state() {
  return {
    products: [
      { id: "raw", name: "Xomashyo", quantity: 10, price: 100, unit: "m²" },
      { id: "ready", name: "Tayyor mahsulot", quantity: 0, price: 200, unit: "dona" },
    ],
    production: [{ id: "order", name: "Kesish", sourceId: "raw", targetId: "ready", input: 2.5, output: 5, status: "Jarayonda" }],
    sales: [], operations: [], expenses: [{ id: "expense", amount: 10 }], employees: [],
  };
}

test("production consumes raw stock and adds finished goods exactly once", () => {
  const original = state();
  const result = completeProduction(original, "order", "2026-10-19T08:00:00Z").state;
  assert.equal(result.products[0].quantity, 7.5);
  assert.equal(result.products[1].quantity, 5);
  assert.equal(result.production[0].status, "Tayyor");
  assert.equal(original.products[0].quantity, 10);
  assert.ok(completeProduction(result, "order", "2026-10-19T08:00:00Z").error);
  assert.deepEqual(result.expenses, original.expenses);
});

test("insufficient or deleted source does not change stock", () => {
  const original = state();
  original.products[0].quantity = 1;
  assert.ok(completeProduction(original, "order", "2026-10-19").error);
  original.products.shift();
  assert.ok(completeProduction(original, "order", "2026-10-19").error);
  assert.equal(original.products[0].quantity, 0);
});

test("first production initializes missing or invalid finished stock references", () => {
  for (const stockReference of [undefined, 0, -1, NaN, Infinity, "invalid"]) {
    const original = state();
    original.products[0].stockReference = 10;
    original.products[1].stockReference = stockReference;
    const produced = completeProduction(original, "order", "2026-10-20T08:00:00Z").state;
    assert.equal(produced.products[1].quantity, 5);
    assert.equal(produced.products[1].stockReference, 5);
    assert.equal(produced.products[0].stockReference, 10);
    assert.equal(original.products[1].stockReference, stockReference);
  }
});

test("depletion and later production preserve a positive finished stock reference", () => {
  const original = state();
  original.products[0].stockReference = 10;
  const produced = completeProduction(original, "order", "2026-10-20T08:00:00Z").state;
  const sold = recordSale(produced, { productId: "ready", quantity: "4", price: "200" }, "sale", "2026-10-20T09:00:00Z").inventory;
  assert.equal(sold.products[1].quantity, 1);
  assert.equal(sold.products[1].stockReference, 5);
  sold.production.push({ ...original.production[0], id: "replenish", output: 8 });
  const replenished = completeProduction(sold, "replenish", "2026-10-20T10:00:00Z").state;
  assert.equal(replenished.products[1].quantity, 9);
  assert.equal(replenished.products[1].stockReference, 5);
  assert.equal(replenished.products[0].stockReference, 10);

  const configured = state();
  configured.products[1].stockReference = 20;
  assert.equal(completeProduction(configured, "order", "2026-10-20T08:00:00Z").state.products[1].stockReference, 20);
});

test("failed production leaves quantities and stock references unchanged", () => {
  const original = state();
  original.products[0].quantity = 1;
  original.products[0].stockReference = 10;
  original.products[1].stockReference = 0;
  const before = structuredClone(original);
  const result = completeProduction(original, "order", "2026-10-20T08:00:00Z");
  assert.ok(result.error);
  assert.equal(result.state, undefined);
  assert.deepEqual(original, before);
});

test("manufactured items can be sold with a matching revenue record", () => {
  const produced = completeProduction(state(), "order", "2026-10-19T08:00:00Z").state;
  const sold = recordSale(produced, { productId: "ready", quantity: "3", price: "200", customer: " Ali " }, "sale", "2026-10-19T09:00:00Z").inventory;
  assert.equal(sold.products[1].quantity, 2);
  assert.equal(sold.sales[0].amount, 600);
  assert.equal(sold.sales[0].customer, "Ali");
  assert.equal(sold.operations.length, 2);
  assert.equal(sold.production.length, 1);
  assert.equal(sold.expenses.length, 1);
  assert.ok(recordSale(sold, { productId: "ready", quantity: "3", price: "200" }, "again", "2026-10-19").error);
});

test("invalid sales are rejected and historical product names stay stable", () => {
  const original = state();
  original.products[1].quantity = 10;
  for (const quantity of ["0", "-1", "Infinity", "", "1.5"]) {
    assert.ok(recordSale(original, { productId: "ready", quantity, price: "20" }, "sale", "2026-10-19").error);
  }
  const sold = recordSale(original, { productId: "ready", quantity: "1", price: "20" }, "sale", "2026-10-19").inventory;
  sold.products[1].name = "Yangi nom";
  assert.equal(sold.sales[0].productName, "Tayyor mahsulot");
});
