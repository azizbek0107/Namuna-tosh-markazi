import EmployeeAttendance from "../components/EmployeeAttendance.jsx";
import { useImperativeHandle, useRef, useState } from "react";
import { X } from "lucide-react";
import { Summary, DataTable, Notice } from "../components/ErpUI.jsx";
import { money } from "../../erp.js";
const empty = { name: "", role: "", phone: "", salary: "", status: "Faol" };

export default function Employees({ employees, onSave, onDelete, attendance = [], bonuses = [], onBonus, attendanceError, marks, onMark, editorRef, now, schedule }) {
  const dialog = useRef(null);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);
  useImperativeHandle(editorRef, () => ({ openAdd() { setForm(empty); setEditing(null); setMessage(null); dialog.current.showModal(); } }), []);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const rows = employees.filter((item) => `${item.name} ${item.role}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="erp-page"><Summary items={[["Jami xodimlar", employees.length + " ta"], ["Faol xodimlar", employees.filter((item) => item.status === "Faol").length + " ta"], ["Oylik ish haqi rejasi", money(employees.filter((item) => item.status === "Faol").reduce((sum, item) => sum + item.salary, 0))]]} />
    <EmployeeAttendance now={now} schedule={schedule} marks={marks} onMark={onMark} employees={employees} attendance={attendance} bonuses={bonuses} onBonus={onBonus} error={attendanceError} />
    <Notice message={message} />
    <dialog ref={dialog} className="warehouse-modal" aria-labelledby="employee-editor-title"><div className="warehouse-modal-heading"><h3 id="employee-editor-title">{editing ? "Xodimni tahrirlash" : "Xodim qo‘shish"}</h3><button type="button" className="warehouse-close-btn" aria-label="Oynani yopish" onClick={() => dialog.current.close()}><X size={20} /></button></div><form className="sales-form" onSubmit={(event) => {
      event.preventDefault(); const error = onSave(form, editing); setMessage({ error: Boolean(error), text: error || "Xodim saqlandi." }); if (!error) { setForm(empty); setEditing(null); dialog.current.close(); }
    }}>
      <label>Ism va familiya<input required maxLength={150} value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
      <label>Lavozim<input required maxLength={100} value={form.role} onChange={(event) => update("role", event.target.value)} /></label>
      <label>Telefon<input type="tel" maxLength={30} value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
      <label>Oylik ish haqi (so‘m)<input required type="number" min="0" step="0.01" value={form.salary} onChange={(event) => update("salary", event.target.value)} /></label>
      <label>Holati<select value={form.status} onChange={(event) => update("status", event.target.value)}><option>Faol</option><option>Nofaol</option></select></label>
      <div className="sales-checkout"><button type="button" className="erp-secondary" onClick={() => dialog.current.close()}>Bekor qilish</button><button className="warehouse-add-btn">Saqlash</button></div>
    </form>{message?.error && <Notice message={message} />}<p className="dashboard-source">Ish haqi reja sifatida ko‘rsatiladi. To‘langan ish haqini Moliya bo‘limiga xarajat sifatida kiriting.</p></dialog>
    <div className="erp-toolbar"><h3>Xodimlar ro‘yxati</h3><input className="erp-search" aria-label="Xodim qidirish" placeholder="Ism yoki lavozim..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    <DataTable headings={["Xodim", "Lavozim", "Telefon", "Ish haqi", "Holati", "Amallar"]} count={rows.length}>{rows.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.role}</td><td>{item.phone || "—"}</td><td>{money(item.salary)}</td><td><span className="erp-status">{item.status}</span></td><td><div className="erp-row-actions"><button onClick={() => { setForm(item); setEditing(item.id); setMessage(null); dialog.current.showModal(); }}>Tahrirlash</button><button onClick={() => { if (window.confirm("Xodim o‘chirilsinmi?")) { onDelete(item.id); if (editing === item.id) { setEditing(null); setForm(empty); } } }}>O‘chirish</button></div></td></tr>)}</DataTable>
  </div>;
}
