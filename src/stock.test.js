import { test } from "node:test";
import assert from "node:assert/strict";
import { getLowStockProducts, normalizeStockProducts } from "./stock.js";

test("migration preserves valid references and product data without mutation", () => {
  const products = [{ id: 1, name: "Granit", unit: "m²", quantity: 20, stockReference: 100, price: 500 }];
  const normalized = normalizeStockProducts(products, [{ id: 1, unit: "m²", quantity: 200 }]);
  assert.deepEqual(normalized, products);
  assert.notEqual(normalized[0], products[0]);
  assert.equal(products[0].stockReference, 100);
});

test("migration uses initial stock only for the same product and unit", () => {
  const initial = [{ id: 1, unit: "m²", quantity: 100 }, { id: 2, unit: "dona", quantity: 80 }];
  const products = [
    { id: 1, unit: "m²", quantity: 20 },
    { id: 2, unit: "dona", quantity: 120 },
    { id: 1, unit: "kg", quantity: 4 },
    { id: 3, unit: "metr", quantity: 12 },
  ];
  assert.deepEqual(normalizeStockProducts(products, initial).map((product) => product.stockReference), [100, 120, 4, 12]);
  assert.equal(products[0].stockReference, undefined);
});

test("reference survives stock consumption and a second normalization after reload", () => {
  const original = normalizeStockProducts([{ id: 1, name: "Granit", unit: "m²", quantity: 100 }]);
  const consumed = original.map((product) => ({ ...product, quantity: 25 }));
  const reloaded = normalizeStockProducts(JSON.parse(JSON.stringify(consumed)));
  assert.equal(reloaded[0].stockReference, 100);
  assert.equal(getLowStockProducts(reloaded)[0].percentage, 25);
  assert.deepEqual(normalizeStockProducts(reloaded), reloaded);
});

test("only stock strictly below thirty percent is included, including fractional quantities", () => {
  const products = [
    { id: "below", name: "Granit", unit: "m²", quantity: 29.999, stockReference: 100 },
    { id: "equal", name: "Marmar", unit: "m²", quantity: 30, stockReference: 100 },
    { id: "above", name: "Kafel", unit: "dona", quantity: 31, stockReference: 100 },
    { id: "decimal-equal", name: "Sokl", unit: "metr", quantity: 0.75, stockReference: 2.5 },
    { id: "decimal-below", name: "Plita", unit: "metr", quantity: 0.749, stockReference: 2.5 },
  ];
  assert.deepEqual(getLowStockProducts(products).map((product) => product.key), ["decimal-below", "below"]);
});

test("floating point rounding at exactly thirty percent does not create an alert", () => {
  const products = [
    { id: "exact-10.3", quantity: 3.09, stockReference: 10.3 },
    { id: "exact-6.7", quantity: 2.01, stockReference: 6.7 },
    { id: "exact-0.17", quantity: 0.051, stockReference: 0.17 },
    { id: "below", quantity: 3.089999999, stockReference: 10.3 },
  ];
  assert.deepEqual(getLowStockProducts(products).map((product) => product.key), ["below"]);
});

test("zero stock remains visible even when its reference is zero or missing", () => {
  const products = [
    { id: "empty", name: "A", unit: "dona", quantity: 0, stockReference: 100 },
    { id: "zero-reference", name: "B", unit: "kg", quantity: 0, stockReference: 0 },
    { id: "missing-reference", name: "D", unit: "metr", quantity: 0 },
    { id: "positive", name: "E", unit: "dona", quantity: 1, stockReference: 0 },
  ];
  const lowStock = getLowStockProducts(products);
  assert.deepEqual(lowStock.map((product) => product.key), ["empty", "zero-reference", "missing-reference"]);
  assert.ok(lowStock.every((product) => product.percentage === 0));
});

test("mixed units remain individual rows, sorted by percentage and Uzbek name", () => {
  const products = [
    { id: "c", name: "Sokl", unit: "dona", quantity: 20, stockReference: 100 },
    { id: "b", name: "Marmar", unit: "kg", quantity: 10, stockReference: 100 },
    { id: "a", name: "Granit", unit: "m²", quantity: 10, stockReference: 100 },
    { id: "d", name: "Granit", unit: "metr", quantity: 5, stockReference: 100 },
  ];
  assert.deepEqual(getLowStockProducts(products), [
    { key: "d", name: "Granit", unit: "metr", quantity: 5, percentage: 5 },
    { key: "a", name: "Granit", unit: "m²", quantity: 10, percentage: 10 },
    { key: "b", name: "Marmar", unit: "kg", quantity: 10, percentage: 10 },
    { key: "c", name: "Sokl", unit: "dona", quantity: 20, percentage: 20 },
  ]);
});

test("invalid references fall back safely and malformed quantities do not create alerts", () => {
  const invalidReferences = [undefined, null, "100", -1, NaN, Infinity];
  const products = invalidReferences.map((stockReference, id) => ({ id, name: `Product ${id}`, quantity: 10, stockReference }));
  assert.deepEqual(getLowStockProducts(products), []);
  assert.ok(normalizeStockProducts(products).every((product) => product.stockReference === 10));
  assert.deepEqual(getLowStockProducts([null, {}, { quantity: NaN }, { quantity: Infinity }, { quantity: -1 }]), []);
  assert.equal(normalizeStockProducts([{ quantity: NaN }])[0].stockReference, 0);
  assert.equal(normalizeStockProducts([{ quantity: 5, stockReference: 0 }])[0].stockReference, 0);
  assert.deepEqual(getLowStockProducts(), []);
  assert.deepEqual(getLowStockProducts(null), []);
  assert.deepEqual(normalizeStockProducts(null), []);
});
