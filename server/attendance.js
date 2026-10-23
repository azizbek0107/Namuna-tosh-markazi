import { fileJsonStore } from './jsonStore.js';
import { randomUUID } from "node:crypto";
import { defaultSchedule, tashkentDay, validSchedule, scheduleTime } from "../src/attendance.js";

export function attendanceStore(directory, storage = fileJsonStore(directory)) {
  const { read, write } = storage;
  const snapshot = (user) => {
    const rows = read("attendance", []);
    return { attendance: user.role === "admin" ? rows : rows.filter((row) => row.userId === user.id), marks: user.role === "admin" ? read("attendance-marks", []) : [], schedule: read("attendance-schedule", defaultSchedule) };
  };
  function mutate(user, data, operation, now = Date.now()) {
    const failure = (status, error) => ({ status, body: { error } });
    if (!user) return failure(401, "Tizimga kiring.");
    if (!["admin", "worker", "cashier"].includes(user.role)) return failure(403, "Davomatga ruxsat yo‘q.");
    if (operation !== "record" && user.role !== "admin") return failure(403, "Faqat admin davomatni tuzatadi yoki bekor qiladi.");
    if (operation === "schedule") {
      if (!validSchedule(data)) return failure(400, "Ish jadvali noto‘g‘ri. Boshlanish vaqti tugash vaqtidan oldin bo‘lsin.");
      write("attendance-schedule", { start: data.start, end: data.end, updatedBy: user.name, updatedAt: new Date(now).toISOString() });
      return { status: 200, body: snapshot(user) };
    }
    const rows = read("attendance", []), time = new Date(now).toISOString();
    if (operation === "record") {
      if (!["arrive", "leave"].includes(data.action)) return failure(400, "Davomat amalini tanlang.");
      const belongs = (row) => row.userId === user.id || (user.employeeId && String(row.employeeId) === String(user.employeeId));
      const open = rows.find((row) => row.userId === user.id && !row.leftAt && !row.cancelledAt);
      if (data.action === "arrive") {
        const schedule = read("attendance-schedule", defaultSchedule);
        if (now < scheduleTime(tashkentDay(now), schedule.start)) return failure(400, "Ish vaqti hali boshlanmagan. Ish boshlash mumkin emas.");
        if (rows.some((row) => belongs(row) && !row.leftAt && !row.cancelledAt)) return failure(409, "Ish allaqachon boshlangan. Avval ishni tugating.");
        if (rows.some((row) => belongs(row) && !row.cancelledAt && tashkentDay(Date.parse(row.arrivedAt)) === tashkentDay(now))) return failure(409, "Bugungi davomat allaqachon qayd etilgan.");
        rows.unshift({ id: randomUUID(), userId: user.id, employeeId: user.employeeId, name: user.name, role: user.role, arrivedAt: time, schedule });
      } else {
        if (!open) return failure(409, "Avval ishni boshlang.");
        open.leftAt = time;
      }
    } else {
      const row = rows.find((item) => item.id === data.id);
      if (!row || row.cancelledAt) return failure(404, "Davomat topilmadi yoki bekor qilingan.");
      if (!String(data.reason ?? "").trim() || String(data.reason).length > 300) return failure(400, "Tuzatish yoki bekor qilish sababini kiriting (300 belgigacha).");
      const before = { arrivedAt: row.arrivedAt, leftAt: row.leftAt ?? null };
      if (operation === "update") {
        const arrived = Date.parse(data.arrivedAt), left = data.leftAt ? Date.parse(data.leftAt) : null;
        if (!Number.isFinite(arrived) || arrived > now || (left !== null && (!Number.isFinite(left) || left < arrived || left > now))) return failure(400, "Vaqtlar noto‘g‘ri: ketish kelishdan oldin yoki kelajakda bo‘lmasin.");
        const others = rows.filter((item) => item.id !== row.id && !item.cancelledAt && (item.userId === row.userId || (row.employeeId && item.employeeId === row.employeeId)));
        if (others.some((item) => tashkentDay(Date.parse(item.arrivedAt)) === tashkentDay(arrived) || (arrived < (item.leftAt ? Date.parse(item.leftAt) : Infinity) && (left ?? Infinity) > Date.parse(item.arrivedAt)))) return failure(409, "Bu xodim uchun takroriy yoki ustma-ust davomat mavjud.");
        row.arrivedAt = new Date(arrived).toISOString(); row.leftAt = left === null ? null : new Date(left).toISOString();
      } else if (operation === "cancel") { row.cancelledAt = time; row.cancelledBy = user.name; }
      else return failure(400, "Amal topilmadi.");
      row.audit = [...(row.audit ?? []), { action: operation, reason: data.reason.trim(), by: user.name, userId: user.id, time, before, after: { arrivedAt: row.arrivedAt, leftAt: row.leftAt ?? null } }];
      row.updatedBy = user.name; row.updatedAt = time;
    }
    write("attendance", rows);
    return { status: 200, body: snapshot(user) };
  }
  return { snapshot, mutate };
}
