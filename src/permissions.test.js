import { test } from "node:test";
import assert from "node:assert/strict";
import { canAccessPage, ownShiftSales, canCompleteOrder } from "./permissions.js";
test("role matrix excludes worker cash access and cashier administrative pages", () => {
  for (const page of ["Asosiy oyna", "Mahsulotlar", "Savdo", "Kassa"]) assert.equal(canAccessPage("cashier", page), true);
  for (const page of ["Ombor", "Moliya", "Sozlamalar", "Xodimlar", "Ishlab chiqarish", "Hisobotlar"]) assert.equal(canAccessPage("cashier", page), false);
  assert.equal(canAccessPage("admin", "Hisobotlar"), true);
  assert.equal(canAccessPage("worker", "Ishlab chiqarish"), true);
  assert.equal(canAccessPage("worker", "Kassa"), false);
  assert.equal(canAccessPage("unknown", "Kassa"), false);
});
test("cashier sees only their open shift and worker can complete only assigned orders", () => {
  const shifts = [{ id: "open", userId: "a" }, { id: "closed", userId: "a", closedAt: "now" }];
  const sales = [{ id: 1, cashierId: "a", shiftId: "open" }, { id: 2, cashierId: "b", shiftId: "open" }, { id: 3, cashierId: "a", shiftId: "closed" }, { id: 4 }];
  assert.deepEqual(ownShiftSales(sales, shifts, "a").map((item) => item.id), [1]);
  assert.deepEqual(ownShiftSales(sales, shifts, "b"), []);
  assert.equal(canCompleteOrder({ id: "a", role: "worker" }, { assigneeId: "b" }), false);
  assert.equal(canCompleteOrder({ id: "a", role: "worker" }, { assigneeId: "a" }), true);
  assert.equal(canCompleteOrder({ id: "a", role: "worker" }, {}), false);
});
