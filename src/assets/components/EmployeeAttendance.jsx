import { attendanceStatus, durationLabel, workedMinutes, tashkentDay } from "../../attendance.js";
import { useState } from "react";
import { DataTable, Notice } from "./ErpUI.jsx";
import { dateTime, money } from "../../erp.js";


export default function EmployeeAttendance({ employees, attendance, bonuses, onBonus, marks = [], error, now, schedule }) {
  const [day, setDay] = useState(() => tashkentDay(Date.now()));
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const start = Date.parse(`${day}T00:00:00+05:00`), end = start + 86400000;
  const sessions = attendance.filter((item) => Date.parse(item.arrivedAt) < end && (!item.leftAt || Date.parse(item.leftAt) >= start));
  function edit(employee) {
    const bonus = bonuses.find((item) => item.employeeId === String(employee.id) && item.day === day);
    setSelected(employee); setAmount(bonus ? String(bonus.amount) : ""); setNote(bonus?.note ?? ""); setMessage(null);
  }
  return <section className="panel"><div className="erp-toolbar"><div><h3>Kunlik davomat va bonuslar</h3><p className="dashboard-source">Kelish va ketish vaqtlari Toshkent vaqti bilan ko‘rsatiladi.</p></div><label>Sana <input className="erp-search" type="date" required value={day} onChange={(event) => { if (event.target.value) { setDay(event.target.value); setSelected(null); } }} /></label></div>
    {error && <p role="alert">{error}</p>}
    <DataTable headings={["Xodim", "Kelgan vaqt", "Ketgan vaqt", "Holat", "Ishlagan vaqt", "Kunlik bonus", "Izoh", "Amal"]} count={employees.length}>{employees.map((employee) => {
      const records = sessions.filter((item) => String(item.employeeId) === String(employee.id));
      const bonus = bonuses.find((item) => item.employeeId === String(employee.id) && item.day === day);
      const confirmation = marks.find((item) => item.employeeId === String(employee.id) && item.day === day);
      return <tr key={employee.id}><td>{employee.name}</td><td>{records.length ? records.map((item) => <div key={item.id}>{dateTime(item.arrivedAt)}</div>) : "—"}</td><td>{records.length ? records.map((item) => <div key={item.id}>{item.leftAt ? dateTime(item.leftAt) : "Hali ketmagan"}</div>) : "—"}</td><td>{attendanceStatus(records[0] ?? { mark: confirmation }, day, schedule, now)}</td><td>{records.length ? durationLabel(records.reduce((total, item) => total + (workedMinutes(item, now) ?? 0), 0)) : "?"}</td><td>{bonus ? money(bonus.amount) : "Belgilanmagan"}</td><td>{bonus?.note || "—"}</td><td><button className="text-button" onClick={() => edit(employee)}>{bonus ? "Bonusni tahrirlash" : "Bonus yozish"}</button></td></tr>;
    })}</DataTable>
    {selected && <form className="sales-form" onSubmit={async (event) => {
      event.preventDefault(); if (busy) return; setBusy(true);
      try { await onBonus({ employeeId: String(selected.id), name: selected.name, day, amount, note }); setMessage({ text: "Kunlik bonus saqlandi." }); setSelected(null); }
      catch (err) { setMessage({ error: true, text: err.message }); } finally { setBusy(false); }
    }}><h3 className="erp-full">{selected.name} · {day}</h3><label>Bonus (so‘m)<input required type="number" min="0" max="1000000000000" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label>Izoh<input maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} /></label><div className="erp-actions"><button disabled={busy} className="erp-secondary">Saqlash</button><button type="button" disabled={busy} className="erp-secondary" onClick={() => setSelected(null)}>Yopish</button></div></form>}
    <Notice message={message} /><p className="dashboard-source">Bonus belgilanishi kassadan to‘lov qilindi degani emas. To‘langan bonus Moliya bo‘limida xarajat sifatida qayd etiladi.</p>
  </section>;
}
