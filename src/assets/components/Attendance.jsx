import { dateTime } from "../../erp.js";
import { defaultSchedule, tashkentDay, workedMinutes, durationLabel } from "../../attendance.js";
import AttendanceAdmin from "./AttendanceAdmin.jsx";
export default function Attendance(props) { return <AttendanceAdmin {...props} />; }
export function AttendanceControl({ rows, onRecord, busy, error, loaded, onRetry, schedule = defaultSchedule, now, embedded = false }) {
  const active = rows.filter((item) => !item.cancelledAt);
  const open = active.find((item) => !item.leftAt);
  const today = active.find((item) => tashkentDay(Date.parse(item.arrivedAt)) === tashkentDay(now));
  const completed = !open && Boolean(today);
  return <section className="panel erp-toolbar attendance-control" style={{ marginBottom: embedded ? 0 : 20 }}><div><h3>Ishni boshlash</h3>
    <p className="dashboard-source">Ish jadvali: {schedule.start}–{schedule.end} · Toshkent vaqti</p>
    <p className="dashboard-source">{open ? dateTime(open.arrivedAt) + ' · ' + durationLabel(workedMinutes(open, now)) : completed ? 'Bugungi ish tugagan: ' + dateTime(today.leftAt) : loaded ? 'Ish hali boshlanmagan.' : 'Davomat yuklanmoqda…'}</p>
    {error && <p role="alert">{error} <button className="text-button" disabled={busy} onClick={onRetry}>Qayta yuklash</button></p>}
  </div><button className="erp-secondary" disabled={busy || !loaded || completed} onClick={() => onRecord(open ? "leave" : "arrive")}>{busy ? "Saqlanmoqda..." : open ? "Ishni tugatish" : completed ? "Bugungi ish tugagan" : "Ishni boshlash"}</button></section>;
}
