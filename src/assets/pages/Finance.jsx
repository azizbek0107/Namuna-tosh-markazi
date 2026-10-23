import { useState } from "react";
import { FinancialSummary, DataTable, Notice, Summary } from "../components/ErpUI.jsx";
import { money, dateTime } from "../../erp.js";

export default function Finance({ sales, expenses, onAdd, onDelete }) {
  const [form, setForm] = useState({ name: "", amount: "", category: "Boshqa" });
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const knownCostSales = sales.filter((item) => Number.isFinite(item.costAmount));
  const gross = knownCostSales.reduce((total, item) => total + item.amount - item.costAmount, 0);
  const debt = sales.filter((item) => item.paymentMethod === "debt").reduce((total, item) => total + item.amount, 0);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const rows = [...sales.map((item) => ({ ...item, name: `${item.productName} · ${item.customer}`, category: "Sotuv", income: true })), ...expenses].filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
  return <div className="erp-page"><FinancialSummary sales={sales} expenses={expenses} /><Summary items={[["Mijozlar qarzdorligi", money(debt)], ["Tannarxi qayd etilgan savdolar yalpi foydasi", money(gross)]]} /><p className="dashboard-source">Yalpi foyda savdo paytidagi tannarx asosida hisoblanadi. {sales.length - knownCostSales.length} ta eski savdoda tannarx yo'q; ular foydaga kiritilmadi.</p>
    <p className="dashboard-source">Tushum va xarajat farqi sof foyda emas: tannarx, soliqlar va boshqa majburiyatlar alohida hisoblanmaydi.</p>
    <section className="panel"><h3>Xarajat kiritish</h3><form className="sales-form" onSubmit={(event) => {
      event.preventDefault(); const error = onAdd(form); setMessage({ error: Boolean(error), text: error || "Xarajat saqlandi." }); if (!error) setForm({ name: "", amount: "", category: "Boshqa" });
    }}>
      <label>Xarajat nomi<input required maxLength={150} value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
      <label>Summa (so‘m)<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => update("amount", event.target.value)} /></label>
      <label>Kategoriya<select value={form.category} onChange={(event) => update("category", event.target.value)}>{["Xomashyo", "Ish haqi", "Transport", "Kommunal", "Boshqa"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <div className="sales-checkout"><button className="warehouse-add-btn">Xarajatni saqlash</button></div>
    </form><Notice message={message} /></section>
    <div className="erp-toolbar"><h3>Kirim va chiqimlar</h3><input className="erp-search" placeholder="Operatsiya qidirish..." aria-label="Moliya operatsiyalarini qidirish" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    <DataTable headings={["Sana", "Nomi", "Kategoriya", "Turi", "Summa", "Amal"]} count={rows.length}>{rows.map((item) => <tr key={item.id}><td>{dateTime(item.time)}</td><td>{item.name}</td><td>{item.category}</td><td>{item.income ? "Kirim" : "Chiqim"}</td><td>{item.income ? "+" : "−"}{money(item.amount)}</td><td>{!item.income && <button className="text-button" onClick={() => { if (window.confirm("Xarajat o‘chirilsinmi?")) onDelete(item.id); }}>O‘chirish</button>}</td></tr>)}</DataTable>
  </div>;
}
