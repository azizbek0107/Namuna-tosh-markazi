import test from "node:test";
import assert from "node:assert/strict";
import { attendanceStatus, attendanceRange, attendanceReport, durationLabel, workedMinutes, tashkentDay, validSchedule } from "./attendance.js";
const day = "2026-10-21";
const at = (clock) => Date.parse(`${day}T${clock}:00+05:00`);
test("Tashkent boundaries, late arrival and missing attendance follow work schedule", () => {
  assert.equal(tashkentDay(Date.parse("2026-10-20T19:00:00Z")), day);
  assert.equal(attendanceStatus({}, day, undefined, at("07:59")), "Kutilmoqda");
  assert.equal(attendanceStatus({}, day, undefined, at("08:00")), "Kelmadi");
  assert.equal(attendanceStatus({ arrivedAt: new Date(at("08:00")).toISOString() }, day), "Ishda");
  assert.equal(attendanceStatus({ arrivedAt: new Date(at("08:01")).toISOString(), leftAt: new Date(at("18:00")).toISOString() }, day), "Kechikkan");
  assert.equal(attendanceStatus({ arrivedAt: new Date(at("07:50")).toISOString(), leftAt: new Date(at("18:00")).toISOString() }, day), "Ketgan");
  assert.equal(attendanceStatus({ cancelledAt: "now" }, day), "Bekor qilingan");
});
test("work duration, overnight work, schedule snapshot and validation", () => {
  assert.equal(workedMinutes({ arrivedAt: new Date(at("08:00")).toISOString(), leftAt: new Date(at("18:15")).toISOString() }), 615);
  assert.equal(durationLabel(615), "10 soat 15 daqiqa");
  assert.equal(workedMinutes({ arrivedAt: "2026-10-20T23:30:00+05:00", leftAt: "2026-10-21T01:00:00+05:00" }), 90);
  assert.equal(workedMinutes({ arrivedAt: new Date(at("08:00")).toISOString() }, at("08:30")), 30);
  assert.equal(attendanceStatus({ arrivedAt: new Date(at("08:30")).toISOString(), schedule: { start: "09:00" } }, day), "Ishda");
  assert.equal(validSchedule({ start: "18:00", end: "08:00" }), false);
  assert.equal(validSchedule({ start: "25:00", end: "26:00" }), false);
  assert.equal(validSchedule({ start: "08:00", end: "18:00" }), true);
});
test("day, week, month history respects boundaries and excludes future absences", () => {
  assert.deepEqual(attendanceRange("week", "2026-01-01"), { start: "2025-12-29", end: "2026-01-05" });
  assert.deepEqual(attendanceRange("month", "2024-02-29"), { start: "2024-02-01", end: "2024-03-01" });
  const rows = [{ id: "r", name: "A", employeeId: "a", arrivedAt: new Date(at("08:10")).toISOString() }];
  const report = attendanceReport({ rows, employees: [{ id: "a", name: "A", status: "Faol" }, { id: "b", name: "B", status: "Faol" }, { id: "c", name: "C", status: "Nofaol" }], start: day, end: "2026-10-25", now: at("09:00") });
  assert.equal(report.length, 2);
  assert.equal(report.find((r) => r.employeeId === "a").status, "Kechikkan");
  assert.equal(report.find((r) => r.employeeId === "b").status, "Kelmadi");
});
