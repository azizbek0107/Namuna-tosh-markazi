import { test } from "node:test";
import assert from "node:assert/strict";
import { getProductSales } from "./productSales.js";

const start = Date.parse("2026-10-19T19:00:00.000Z");
const end = Date.parse("2026-10-20T19:00:00.000Z");
const sale = (overrides = {}) => ({ productId: "granit", productName: "Granit", unit: "m²", quantity: 1, time: "2026-10-20T08:00:00.000Z", ...overrides });
const summarize = (sales) => getProductSales(sales, start, end);

test("selected period includes its start and excludes its end", () => {
  const rows = summarize([
    sale({ quantity: 2, time: "2026-10-19T18:59:59.999Z" }),
    sale({ quantity: 3, time: "2026-10-19T19:00:00.000Z" }),
    sale({ quantity: 5, time: "2026-10-20T18:59:59.999Z" }),
    sale({ quantity: 7, time: "2026-10-20T19:00:00.000Z" }),
  ]);
  assert.deepEqual(rows, [{ key: JSON.stringify(["granit", "m²"]), name: "Granit", unit: "m²", quantity: 8 }]);
});

test("aggregates each product and unit separately and rounds decimal totals", () => {
  const rows = summarize([
    sale({ quantity: 0.1 }),
    sale({ quantity: 0.2 }),
    sale({ productId: "second", quantity: 2 }),
    sale({ unit: "dona", quantity: 5 }),
  ]);
  assert.deepEqual(rows, [
    { key: JSON.stringify(["granit", "dona"]), name: "Granit", unit: "dona", quantity: 5 },
    { key: JSON.stringify(["second", "m²"]), name: "Granit", unit: "m²", quantity: 2 },
    { key: JSON.stringify(["granit", "m²"]), name: "Granit", unit: "m²", quantity: 0.3 },
  ]);
});

test("legacy sales group by name and unit without merging unrelated missing IDs", () => {
  const rows = summarize([
    sale({ productId: undefined, quantity: 2 }),
    sale({ productId: null, quantity: 3 }),
    sale({ productId: "", productName: "Marmar", quantity: 4 }),
    sale({ productId: undefined, unit: "kg", quantity: 6 }),
    sale({ productId: "legacy", quantity: 7 }),
  ]);
  assert.equal(rows.length, 4);
  assert.equal(rows.find((row) => row.key === JSON.stringify(["legacy", "Granit", "m²"])).quantity, 5);
  assert.equal(rows.find((row) => row.name === "Marmar").quantity, 4);
  assert.equal(rows.find((row) => row.unit === "kg").quantity, 6);
  assert.equal(rows.find((row) => row.key === JSON.stringify(["legacy", "m²"])).quantity, 7);
});

test("latest valid sale supplies renamed product names independent of input order", () => {
  const sales = [
    sale({ productName: "Old name", quantity: 2, time: "2026-10-20T06:00:00Z" }),
    sale({ productName: "New name", quantity: 3, time: "2026-10-20T09:00:00Z" }),
    sale({ productName: "Different unit name", unit: "dona", quantity: 4, time: "2026-10-20T07:00:00Z" }),
  ];
  assert.deepEqual(summarize(sales), summarize([...sales].reverse()));
  assert.deepEqual(summarize(sales).map(({ name, quantity }) => ({ name, quantity })), [
    { name: "Different unit name", quantity: 4 }, { name: "New name", quantity: 5 },
  ]);
});

test("equal timestamps choose a deterministic product name and sorted ties use Uzbek names", () => {
  const sales = [sale({ productName: "Zebra" }), sale({ productName: "Anor" }), sale({ productId: "other", productName: "Bodom", quantity: 2 })];
  assert.deepEqual(summarize(sales), summarize([...sales].reverse()));
  assert.deepEqual(summarize(sales).map((row) => row.name), ["Anor", "Bodom"]);
});

test("malformed rows, invalid quantities, names and dates are ignored without mutation", () => {
  const good = Object.freeze(sale({ productId: 0, quantity: 0.1234567894 }));
  const sales = Object.freeze([
    null, undefined, false, [], {},
    ...[0, -1, NaN, Infinity, -Infinity, "4", null].map((quantity) => sale({ quantity })),
    ...["", " ", null, 12].map((productName) => sale({ productName })),
    ...["invalid", undefined, null, {}, Symbol("bad")].map((time) => sale({ time })),
    good,
  ]);
  assert.deepEqual(summarize(sales), [{ key: JSON.stringify([0, "m²"]), name: "Granit", unit: "m²", quantity: 0.123456789 }]);
  assert.equal(good.quantity, 0.1234567894);
  for (const invalid of [undefined, null, {}, "sales"]) assert.deepEqual(summarize(invalid), []);
  for (const [from, to] of [[NaN, end], [start, Infinity], [end, start], [start, start]]) assert.deepEqual(getProductSales([good], from, to), []);
});

test("very large finite quantities never overflow while aggregating or rounding", () => {
  const rows = summarize([sale({ quantity: Number.MAX_VALUE }), sale({ quantity: Number.MAX_VALUE })]);
  assert.equal(rows[0].quantity, Number.MAX_VALUE);
  assert.ok(Number.isFinite(rows[0].quantity));
  assert.equal(summarize([sale({ quantity: 1e300 })])[0].quantity, 1e300);
});
