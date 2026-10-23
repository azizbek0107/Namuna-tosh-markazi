import { useRef, useState } from "react";
import { DataTable, Notice } from "./ErpUI.jsx";
import { dateTime, exportCsv } from "../../erp.js";
import { exportExcel } from "../../excelExport.js";
import { attendanceRange, attendanceReport, defaultSchedule, durationLabel, tashkentDay } from "../../attendance.js";
import "./Attendance.css";

const localTime = (value) => value ? new Date(Date.parse(value) + 5 * 3600000).toISOString().slice(0, 16) : "";
const isoTime = (value) => value ? new Date(`${value}:00+05:00`).toISOString() : null;
export default function AttendanceAdmin({ rows, employees, now, error, marks = [], schedule = defaultSchedule, onMutate, busy }) {
  const [period, setPeriod] = useState("day"), [day, setDay] = useState(() => tashkentDay(Date.now()));
  const [employee, setEmployee] = useState(""), [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null), [form, setForm] = useState({ arrivedAt: "", leftAt: "", reason: "" });
  const [message, setMessage] = useState(null), [hours, setHours] = useState(null), [exporting, setExporting] = useState(false);
  const dialog = useRef(null);
  const range = attendanceRange(period, day);
  const report = attendanceReport({ rows, employees, marks, ...range, schedule, now });
  const people = new Map(employees.map((item) => [String(item.id), item.name]));
  rows.forEach((item) => people.set(item.employeeId ? String(item.employeeId) : `user:${item.userId}`, item.name));
  const filtered = report.filter((item) => (!employee || (item.employeeId ? String(item.employeeId) : `user:${item.userId}`) === employee) && (!status || item.status === status));
  const events = rows.filter((item) => !item.cancelledAt).flatMap((item) => [{ id: `${item.id}-in`, name: item.name, time: item.arrivedAt, text: "ishga keldi" }, ...(item.leftAt ? [{ id: `${item.id}-out`, name: item.name, time: item.leftAt, text: "ishdan ketdi" }] : [])]).sort((a, b) => Date.parse(b.time) - Date.parse(a.time)).slice(0, 6);
  function edit(item) {
    setEditing(item); setForm({ arrivedAt: localTime(item.arrivedAt), leftAt: localTime(item.leftAt), reason: "" }); setMessage(null); dialog.current.showModal();
  }
  async function save(operation) {
    if (!form.reason.trim()) { setMessage({ error: true, text: "O‘zgartirish sababini kiriting." }); return; }
    try {
      await onMutate(operation, { id: editing.id, arrivedAt: isoTime(form.arrivedAt), leftAt: isoTime(form.leftAt), reason: form.reason });
      dialog.current.close(); setMessage({ text: operation === "cancel" ? "Davomat bekor qilindi. Tarix saqlandi." : "Davomat tuzatildi." });
    } catch (err) { setMessage({ error: true, text: err.message }); }
  }
  async function download(format) {
    const headers = ["Sana", "Xodim", "Kelgan vaqt", "Ketgan vaqt", "Ishlagan vaqt", "Holat", "Oxirgi tuzatgan", "Tuzatish vaqti", "Sabab"];
    const data = filtered.map((item) => [item.day, item.name, item.arrivedAt ? dateTime(item.arrivedAt) : "", item.leftAt ? dateTime(item.leftAt) : "", durationLabel(item.minutes), item.status, item.updatedBy ?? item.mark?.confirmedBy ?? "", item.updatedAt ? dateTime(item.updatedAt) : "", item.audit?.at(-1)?.reason ?? ""]);
    if (format === "csv") return exportCsv("davomat.csv", headers, data);
    setExporting(true); try { await exportExcel("davomat.xlsx", headers, data); } finally { setExporting(false); }
  }
  return <section className="panel attendance-panel" style={{ marginTop: 22 }}><div className="panel-heading"><div><h3>Xodimlar davomati va tarixi</h3><p>Toshkent vaqti · Ish jadvali {schedule.start}–{schedule.end}</p></div></div>
    {error && <p role="alert" className="sales-error">{error}</p>}<Notice message={message} />
    <div className="attendance-filters">
      <label>Davr<select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="day">Kun</option><option value="week">Hafta</option><option value="month">Oy</option></select></label>
      <label>Sana<input type="date" required value={day} max={tashkentDay(now)} onChange={(event) => { if (event.target.value) setDay(event.target.value); }} /></label>
      <label>Xodim<select value={employee} onChange={(event) => setEmployee(event.target.value)}><option value="">Barcha xodimlar</option>{[...people].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label>Holat<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Barcha holatlar</option>{["Ishda", "Ketgan", "Kelmadi", "Kechikkan", "Kutilmoqda", "Kelgani tasdiqlangan", "Bekor qilingan"].map((text) => <option key={text}>{text}</option>)}</select></label>
      <div className="erp-actions"><button className="erp-secondary" disabled={exporting} onClick={() => download("xlsx")}>{exporting ? "Tayyorlanmoqda…" : "Excel yuklash"}</button><button className="erp-secondary" onClick={() => download("csv")}>CSV yuklash</button></div>
    </div>
    <p className="dashboard-source">{range.start} — {new Date(Date.parse(range.end) - 86400000).toISOString().slice(0, 10)} · {filtered.length} ta yozuv. Kelmadi holati ish boshlanish vaqtidan keyin belgilanadi.</p>
    <DataTable headings={["Sana", "Xodim", "Kelgan vaqt", "Ketgan vaqt", "Ishlagan vaqt", "Holat", "Tuzatish / tarix"]} count={filtered.length}>{filtered.map((item) => <tr key={item.id}><td>{item.day}</td><td>{item.name}</td><td>{item.arrivedAt ? dateTime(item.arrivedAt) : "—"}</td><td>{item.leftAt ? dateTime(item.leftAt) : "—"}</td><td>{durationLabel(item.minutes)}</td><td><span className={`attendance-status ${item.status === "Kechikkan" || item.status === "Kelmadi" ? "attendance-alert" : ""}`}>{item.status}</span>{item.status === "Kechikkan" && <small className="attendance-note">{item.leftAt ? "Ketgan" : "Ishda"}</small>}</td><td>{item.arrivedAt && !item.cancelledAt && <button className="text-button" onClick={() => edit(item)}>Tuzatish / bekor qilish</button>}{item.audit?.length > 0 && <details><summary>Tuzatish tarixi ({item.audit.length})</summary>{item.audit.map((audit, index) => <div className="attendance-audit" key={index}><strong>{audit.by} · {dateTime(audit.time)}</strong><p>{audit.action === "cancel" ? "Bekor qilindi" : "Tuzatildi"}: {audit.reason}</p><small>Oldin: {dateTime(audit.before.arrivedAt)} — {audit.before.leftAt ? dateTime(audit.before.leftAt) : "—"}<br />Keyin: {dateTime(audit.after.arrivedAt)} — {audit.after.leftAt ? dateTime(audit.after.leftAt) : "—"}</small></div>)}</details>}</td></tr>)}</DataTable>
    <details className="attendance-schedule"><summary>Ish jadvalini sozlash</summary><form className="sales-form" onSubmit={async (event) => {
      event.preventDefault(); try { await onMutate("schedule", hours ?? schedule); setHours(null); setMessage({ text: "Ish jadvali saqlandi. Yangi kelishlar uchun amal qiladi." }); } catch (err) { setMessage({ error: true, text: err.message }); }
    }}><label>Ish boshlanishi<input type="time" required value={(hours ?? schedule).start} onChange={(event) => setHours({ ...(hours ?? schedule), start: event.target.value })} /></label><label>Ish tugashi<input type="time" required value={(hours ?? schedule).end} onChange={(event) => setHours({ ...(hours ?? schedule), end: event.target.value })} /></label><button disabled={busy} className="erp-secondary">Jadvalni saqlash</button></form></details>
    <h3>So‘nggi kelish-ketish xabarlari</h3><div className="popover-results">{events.map((event) => <p className="popover-result" key={event.id}><strong>{event.name} {event.text}</strong><small>{dateTime(event.time)}</small></p>)}{!events.length && <p className="dashboard-source">Hali davomat xabarlari yo‘q.</p>}</div>
    <dialog ref={dialog} className="warehouse-modal attendance-dialog" aria-labelledby="attendance-editor-title"><h3 id="attendance-editor-title">{editing?.name} · Davomatni tuzatish</h3><p className="dashboard-source">Vaqtlarni Toshkent vaqti bo‘yicha kiriting.</p><form className="sales-form" onSubmit={(event) => { event.preventDefault(); save("update"); }}>
      <label>Kelgan vaqt<input type="datetime-local" required value={form.arrivedAt} onChange={(event) => setForm({ ...form, arrivedAt: event.target.value })} /></label><label>Ketgan vaqt<input type="datetime-local" value={form.leftAt} onChange={(event) => setForm({ ...form, leftAt: event.target.value })} /></label><label className="erp-full">Sabab<input required maxLength={300} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></label><div className="erp-actions erp-full"><button className="erp-secondary" disabled={busy}>Tuzatishni saqlash</button><button className="erp-secondary" type="button" disabled={busy} onClick={() => save("cancel")}>Davomatni bekor qilish</button><button className="erp-secondary" type="button" disabled={busy} onClick={() => dialog.current.close()}>Yopish</button></div></form>{message?.error && <Notice message={message} />}</dialog>
  </section>;
}
