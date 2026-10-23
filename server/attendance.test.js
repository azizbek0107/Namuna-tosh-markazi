import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, unlinkSync, rmdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { attendanceStore } from "./attendance.js";
const worker = { id: "w1", name: "Ishchi", employeeId: "e1", role: "worker" };
const admin = { id: "a1", name: "Admin", role: "admin" };
const at = (day, time) => Date.parse(`2026-10-${day}T${time}:00+05:00`);
function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "stonex-attendance-"));
  t.after(() => { for (const file of readdirSync(directory)) unlinkSync(join(directory, file)); rmdirSync(directory); });
  return { directory, store: attendanceStore(directory) };
}
test("arrival before configured start is rejected without recording attendance", (t) => {
  const { store } = fixture(t);
  store.mutate(admin, { start: "09:00", end: "18:00" }, "schedule");
  const early = store.mutate(worker, { action: "arrive" }, "record", at(21, "08:59"));
  assert.equal(early.status, 400);
  assert.match(early.body.error, /Ish boshlash mumkin emas/);
  assert.equal(store.snapshot(worker).attendance.length, 0);
  assert.equal(store.mutate(worker, { action: "arrive" }, "record", at(21, "09:00")).status, 200);
});
test("one arrival per Tashkent day, authenticated identity, leave and persistence", (t) => {
  const { store, directory } = fixture(t);
  assert.equal(store.mutate(null, { action: "arrive" }, "record").status, 401);
  const arrive = store.mutate(worker, { action: "arrive", userId: "fake", employeeId: "fake" }, "record", at(21, "08:00"));
  assert.equal(arrive.body.attendance[0].userId, worker.id);
  assert.equal(arrive.body.attendance[0].employeeId, worker.employeeId);
  assert.equal(store.mutate(worker, { action: "arrive" }, "record", at(21, "08:01")).status, 409);
  assert.equal(store.mutate(worker, { action: "leave" }, "record", at(21, "18:00")).status, 200);
  assert.equal(store.mutate(worker, { action: "arrive" }, "record", at(21, "18:10")).status, 409);
  assert.equal(store.mutate(worker, { action: "leave" }, "record", at(21, "18:11")).status, 409);
  assert.equal(attendanceStore(directory).snapshot(worker).attendance.length, 1);
  assert.equal(store.snapshot({ ...worker, id: "other" }).attendance.length, 0);
  assert.equal(store.mutate(worker, { action: "arrive" }, "record", at(22, "08:00")).status, 200);
});
test("admin-only changes validate timestamps, preserve audit and cancelled records", (t) => {
  const { store } = fixture(t);
  const row = store.mutate(worker, { action: "arrive" }, "record", at(21, "09:00")).body.attendance[0];
  const data = { id: row.id, arrivedAt: "2026-10-21T08:00:00+05:00", leftAt: "2026-10-21T18:00:00+05:00", reason: "Soat xato" };
  for (const operation of ["update", "cancel", "schedule"]) assert.equal(store.mutate(worker, data, operation, at(21, "19:00")).status, 403);
  assert.equal(store.mutate(admin, { ...data, reason: "" }, "update", at(21, "19:00")).status, 400);
  assert.equal(store.mutate(admin, { ...data, leftAt: "2026-10-21T07:00:00+05:00" }, "update", at(21, "19:00")).status, 400);
  assert.equal(store.mutate(admin, data, "update", at(21, "19:00")).status, 200);
  const fixed = store.snapshot(admin).attendance[0];
  assert.equal(fixed.audit[0].by, "Admin");
  assert.equal(fixed.audit[0].before.arrivedAt, row.arrivedAt);
  assert.equal(store.mutate(admin, { id: row.id, reason: "Takroriy" }, "cancel", at(21, "19:01")).status, 200);
  assert.equal(store.snapshot(admin).attendance[0].audit.length, 2);
  assert.ok(store.snapshot(admin).attendance[0].cancelledAt);
  assert.equal(store.mutate(admin, data, "update", at(21, "19:02")).status, 404);
});
test("schedule persists and existing arrival keeps its schedule", (t) => {
  const { store, directory } = fixture(t);
  store.mutate(worker, { action: "arrive" }, "record", at(21, "08:10"));
  assert.equal(store.mutate(admin, { start: "19:00", end: "08:00" }, "schedule").status, 400);
  assert.equal(store.mutate(admin, { start: "09:00", end: "18:00" }, "schedule").status, 200);
  const data = attendanceStore(directory).snapshot(admin);
  assert.equal(data.schedule.start, "09:00");
  assert.equal(data.attendance[0].schedule.start, "08:00");
});
