export const defaultSchedule = { start: "08:00", end: "18:00" };
export const tashkentDay = (time) => new Date(Number(time) + 5 * 3600000).toISOString().slice(0, 10);
export const dayStart = (day) => Date.parse(`${day}T00:00:00+05:00`);
export const validDay = (day) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
export const scheduleTime = (day, time) => Date.parse(`${day}T${time}:00+05:00`);
export function validSchedule(schedule) {
  return [schedule?.start, schedule?.end].every((time) => typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)) && schedule.start < schedule.end;
}
export function workedMinutes(row, now = Date.now()) {
  if (!row.arrivedAt || row.cancelledAt) return null;
  return Math.max(0, Math.floor(((row.leftAt ? Date.parse(row.leftAt) : now) - Date.parse(row.arrivedAt)) / 60000));
}
export const durationLabel = (minutes) => minutes === null ? "—" : `${Math.floor(minutes / 60)} soat ${minutes % 60} daqiqa`;
export function attendanceStatus(row, day, schedule = defaultSchedule, now = Date.now()) {
  if (row?.cancelledAt) return "Bekor qilingan";
  if (row?.arrivedAt) {
    if (Date.parse(row.arrivedAt) > scheduleTime(day, row.schedule?.start ?? schedule.start)) return "Kechikkan";
    return row.leftAt ? "Ketgan" : "Ishda";
  }
  if (row?.mark?.status === "absent") return "Kelmadi";
  if (row?.mark?.status === "present") return "Kelgani tasdiqlangan";
  return now >= scheduleTime(day, schedule.start) ? "Kelmadi" : "Kutilmoqda";
}
export function attendanceRange(period, day) {
  const date = new Date(`${day}T12:00:00Z`);
  if (period === "week") date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  if (period === "month") date.setUTCDate(1);
  const start = date.toISOString().slice(0, 10);
  if (period === "day") date.setUTCDate(date.getUTCDate() + 1);
  if (period === "week") date.setUTCDate(date.getUTCDate() + 7);
  if (period === "month") date.setUTCMonth(date.getUTCMonth() + 1);
  return { start, end: date.toISOString().slice(0, 10) };
}
export function attendanceReport({ rows, employees, marks = [], start, end, schedule = defaultSchedule, now = Date.now() }) {
  const result = [];
  const today = tashkentDay(now);
  for (let time = dayStart(start); time < dayStart(end) && time <= dayStart(today); time += 86400000) {
    const day = tashkentDay(time);
    const daily = rows.filter((row) => tashkentDay(Date.parse(row.arrivedAt)) === day);
    for (const row of daily) result.push({ ...row, day, status: attendanceStatus(row, day, schedule, now), minutes: workedMinutes(row, now) });
    const people = [...employees];
    for (const mark of marks.filter((item) => item.day === day)) if (!people.some((p) => String(p.id) === mark.employeeId)) people.push({ id: mark.employeeId, name: mark.name, status: "Faol" });
    for (const employee of people) {
      if (employee.status !== "Faol" || daily.some((row) => !row.cancelledAt && String(row.employeeId) === String(employee.id))) continue;
      const mark = marks.find((item) => item.employeeId === String(employee.id) && item.day === day);
      result.push({ id: `${employee.id}-${day}`, employeeId: String(employee.id), name: employee.name, day, mark, minutes: null, status: attendanceStatus({ mark }, day, schedule, now) });
    }
  }
  return result.sort((a, b) => b.day.localeCompare(a.day) || a.name.localeCompare(b.name, "uz"));
}
