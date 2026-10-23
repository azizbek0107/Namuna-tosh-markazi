import { test } from "node:test";
import assert from "node:assert/strict";
import { nextProductCode, normalizeCatalogProducts, prepareProduct } from "./catalog.js";

const draft = (overrides = {}) => ({ id: 1, name: "Granit", category: "Tosh", unit: "m²", quantity: 10, price: 500, ...overrides });

test("legacy products receive distinct IDs, minimum stock, and a sale price without mutation", () => {
  const products = [draft(), draft({ id: 2, name: "Marmar", price: 800, stockReference: 100, details: { color: "white" } })];
  const normalized = normalizeCatalogProducts(products);
  assert.deepEqual(normalized.map(({ code, minimumStock, salePrice }) => ({ code, minimumStock, salePrice })), [
    { code: "STX-0001", minimumStock: 0, salePrice: 500 },
    { code: "STX-0002", minimumStock: 0, salePrice: 800 },
  ]);
  assert.equal(products[0].code, undefined);
  assert.notEqual(normalized[0], products[0]);
  assert.equal(normalized[1].stockReference, 100);
  assert.deepEqual(normalized[1].details, { color: "white" });
  assert.deepEqual(normalizeCatalogProducts(JSON.parse(JSON.stringify(normalized))), normalized);
});

test("migration reserves later codes and fixes duplicates deterministically", () => {
  const products = [
    draft(), draft({ id: 2, code: " stx-0001 " }), draft({ id: 3, code: "StX-0001" }),
    draft({ id: 4, code: "stx-0003" }), draft({ id: 5, code: "bad code" }),
    draft({ id: 6, code: "Stone.6_test-A" }),
  ];
  const normalized = normalizeCatalogProducts(products);
  assert.deepEqual(normalized.map((product) => product.code), ["STX-0002", "STX-0001", "STX-0004", "STX-0003", "STX-0005", "STONE.6_TEST-A"]);
  assert.deepEqual(normalizeCatalogProducts(normalized), normalized);
  assert.equal(nextProductCode(normalized), "STX-0006");
});

test("valid catalog fields persist and invalid optional stored values receive defaults", () => {
  const products = [draft({ code: "CUSTOM-1", minimumStock: 3.5, salePrice: 900 }), draft({ id: 2, unit: "dona", minimumStock: 0.5, salePrice: -1 })];
  const normalized = normalizeCatalogProducts(products);
  assert.equal(normalized[0].minimumStock, 3.5);
  assert.equal(normalized[0].salePrice, 900);
  assert.equal(normalized[0].price, 500);
  assert.equal(normalized[1].minimumStock, 0);
  assert.equal(normalized[1].salePrice, 500);
  assert.deepEqual(normalizeCatalogProducts(null), []);
  assert.equal(nextProductCode(), "STX-0001");
});

test("new products trim text, parse form values, and have distinct cost and sale prices", () => {
  const { product, error } = prepareProduct(draft({ name: " Granit ", category: " Tosh ", code: " stone-01 ", quantity: "2.5", price: "500", salePrice: "750", minimumStock: "1.5", extra: "retained" }));
  assert.equal(error, undefined);
  assert.deepEqual(product, draft({ name: "Granit", code: "STONE-01", quantity: 2.5, price: 500, salePrice: 750, minimumStock: 1.5, stockReference: 2.5, extra: "retained" }));
  assert.equal(prepareProduct(draft()).product.code, "STX-0001");
  assert.equal(prepareProduct(draft()).product.salePrice, 500);
  assert.equal(prepareProduct(draft()).product.minimumStock, 0);
});

test("warehouse partial edits preserve catalog settings and unknown properties", () => {
  const existing = draft({ code: "STONE-1", minimumStock: 7, salePrice: 900, stockReference: 100, extra: "retained" });
  const result = prepareProduct({ id: 1, name: " New name ", category: "Tosh", unit: "m²", quantity: 8, price: 600 }, [existing], 1);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.product, { ...existing, name: "New name", quantity: 8, price: 600 });
  assert.equal(existing.name, "Granit");
  assert.equal(prepareProduct({ price: 700 }, [existing], 1).product.salePrice, 900);
  assert.equal(prepareProduct({ id: "replacement" }, [existing], 1).product.id, 1);
});

test("codes must be valid and unique while a product can retain its own code", () => {
  const existing = draft({ code: "STONE-1", minimumStock: 0, salePrice: 700, stockReference: 10 });
  assert.equal(prepareProduct({ code: " stone-1 " }, [existing], 1).product.code, "STONE-1");
  assert.ok(prepareProduct(draft({ id: 2, code: "stone-1" }), [existing]).error);
  for (const code of ["", " ", "bad code", "tosh/1", "TÖSH", "ſtone", "ß", "A".repeat(41), null, 123]) {
    assert.ok(prepareProduct(draft({ code })).error, `Expected invalid code: ${code}`);
  }
  assert.equal(prepareProduct(draft({ code: "a._-0" })).product.code, "A._-0");
});

test("missing identity, invalid edit identity, and required text are rejected", () => {
  for (const id of [undefined, null, "", " ", NaN, Infinity, {}, true]) assert.ok(prepareProduct(draft({ id })).error);
  assert.ok(prepareProduct(draft(), [draft()]).error);
  assert.ok(prepareProduct(draft(), [], 4).error);
  assert.ok(prepareProduct(null).error);
  for (const field of ["name", "category", "unit"]) {
    for (const value of ["", " ", null, 123]) assert.ok(prepareProduct(draft({ [field]: value })).error);
  }
});

test("all quantities and prices reject invalid, negative, blank, and nonfinite values", () => {
  for (const field of ["quantity", "price", "salePrice", "minimumStock", "stockReference"]) {
    for (const value of [-1, "-2", NaN, Infinity, "Infinity", "invalid", "", " ", null, false, [], {}]) {
      assert.ok(prepareProduct(draft({ [field]: value })).error, `Expected invalid ${field}: ${String(value)}`);
    }
  }
  assert.ok(prepareProduct(draft({ quantity: Number.MAX_VALUE, price: 2 })).error);
  assert.ok(prepareProduct(draft({ quantity: Number.MAX_VALUE, price: 0, salePrice: 2 })).error);
});

test("unit constraints and stock references permit zero inventory and decimal measured stock", () => {
  assert.ok(prepareProduct(draft({ unit: "dona", quantity: 1.5 })).error);
  assert.ok(prepareProduct(draft({ unit: "dona", minimumStock: 1.5 })).error);
  assert.ok(prepareProduct(draft({ quantity: 1, stockReference: 0 })).error);
  const empty = prepareProduct(draft({ unit: "dona", quantity: 0, price: 0, salePrice: 0, minimumStock: 0, stockReference: 0 }));
  assert.equal(empty.error, undefined);
  assert.equal(empty.product.stockReference, 0);
  assert.equal(prepareProduct(draft({ quantity: 0.5, minimumStock: 0.25 })).error, undefined);
});
