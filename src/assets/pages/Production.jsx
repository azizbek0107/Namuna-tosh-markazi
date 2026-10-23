import { useState } from "react";
import { Summary, DataTable, Notice } from "../components/ErpUI.jsx";
import { dateTime } from "../../erp.js";

export default function Production({ products, orders, onAdd, onComplete, onDelete, admin = true, workers = [], onAssign }) {
  const [form, setForm] = useState({ name: "", sourceId: "", targetId: "", input: "", output: "", assigneeId: "" });
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const source = products.find((item) => String(item.id) === form.sourceId);
  const target = products.find((item) => String(item.id) === form.targetId);
  const rows = orders.filter((order) => order.name.toLowerCase().includes(search.trim().toLowerCase()));
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return <div className="erp-page">
    <Summary items={[["Jami buyurtmalar", orders.length + " ta"], ["Jarayonda", orders.filter((item) => item.status !== "Tayyor").length + " ta"], ["Tayyor", orders.filter((item) => item.status === "Tayyor").length + " ta"]]} />
    {admin && <section className="panel"><h3>Ishlab chiqarish buyurtmasi</h3><p className="dashboard-source">Yakunlanganda xomashyo ayriladi va tayyor mahsulot omborga qo‘shiladi. Har bir miqdor o‘z birligida kiritiladi.</p>
      <form className="sales-form" onSubmit={(event) => {
        event.preventDefault(); const error = onAdd(form);
        setMessage({ error: Boolean(error), text: error || "Buyurtma yaratildi." });
        if (!error) setForm({ name: "", sourceId: "", targetId: "", input: "", output: "" });
      }}>
        <label className="erp-full">Buyurtma nomi<input required maxLength={150} value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
        <label>Xomashyo<select required value={form.sourceId} onChange={(event) => update("sourceId", event.target.value)}><option value="">Tanlang</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit})</option>)}</select></label>
        <label>Tayyor mahsulot<select required value={form.targetId} onChange={(event) => update("targetId", event.target.value)}><option value="">Tanlang</option>{products.filter((item) => String(item.id) !== form.sourceId).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}</select></label>
        <label>Sarflanadigan miqdor {source && `(${source.unit})`}<input required type="number" min="0.000000001" step={source?.unit === "dona" ? "1" : "any"} value={form.input} onChange={(event) => update("input", event.target.value)} /></label>
        <label>Chiqadigan miqdor {target && `(${target.unit})`}<input required type="number" min="0.000000001" step={target?.unit === "dona" ? "1" : "any"} value={form.output} onChange={(event) => update("output", event.target.value)} /></label>
        <label>Ishchi<select value={form.assigneeId} onChange={(event) => update("assigneeId", event.target.value)}><option value="">Biriktirilmagan</option>{workers.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.login})</option>)}</select></label>
        <div className="sales-checkout"><button className="warehouse-add-btn">Buyurtma yaratish</button></div>
      </form><Notice message={message} />
    </section>}
    <Notice message={message} />
    <div className="erp-toolbar"><h3>Buyurtmalar</h3><input className="erp-search" aria-label="Buyurtma qidirish" placeholder="Buyurtmani qidirish..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    <DataTable headings={["Buyurtma", "Sana", "Xomashyo", "Natija", "Ishchi", "Holat", "Amallar"]} count={rows.length}>{rows.map((item) => <tr key={item.id}><td>{item.name}</td><td>{dateTime(item.time)}</td><td>{item.sourceName}: {item.input} {item.sourceUnit}</td><td>{item.targetName}: {item.output} {item.targetUnit}</td><td>{admin && item.status !== "Tayyor" ? <select aria-label={`${item.name} uchun ishchi`} value={item.assigneeId ?? ""} onChange={(event) => onAssign(item.id, event.target.value)}><option value="">Biriktirilmagan</option>{workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name} ({worker.login})</option>)}</select> : item.assigneeName ?? "Biriktirilmagan"}</td><td><span className="erp-status">{item.status}</span></td><td><div className="erp-row-actions"><button disabled={item.status === "Tayyor"} onClick={() => { const error = onComplete(item.id); setMessage({ error: Boolean(error), text: error || "Buyurtma yakunlandi. Ombor yangilandi." }); }}>Yakunlash</button>{admin && item.status !== "Tayyor" && <button onClick={() => { if (window.confirm("Buyurtma bekor qilinsinmi?")) onDelete(item.id); }}>Bekor qilish</button>}</div></td></tr>)}</DataTable>
  </div>;
}
