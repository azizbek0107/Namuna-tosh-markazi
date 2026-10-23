import { useState } from "react";
import { Notice } from "../components/ErpUI.jsx";

export default function Settings({ settings, onSave, theme, setTheme, storageError, onBackup, onExcel }) {
  const [form, setForm] = useState(settings);
  const [message, setMessage] = useState(null);
  return <div className="erp-page"><section className="panel"><h3>Korxona sozlamalari</h3><form className="sales-form" onSubmit={(event) => {
    event.preventDefault(); if (!form.company.trim() || !form.admin.trim()) { setMessage({ error: true, text: "Korxona va administrator nomini kiriting." }); return; }
    onSave({ company: form.company.trim(), admin: form.admin.trim(), phone: form.phone.trim() }); setMessage({ text: "Sozlamalar saqlandi." });
  }}>
    <label>Korxona nomi<input required maxLength={100} value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></label>
    <label>Administrator<input required maxLength={100} value={form.admin} onChange={(event) => setForm({ ...form, admin: event.target.value })} /></label>
    <label>Telefon<input type="tel" maxLength={30} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
    <div className="sales-checkout"><button className="warehouse-add-btn">Saqlash</button></div>
  </form><Notice message={message} /></section>
    <section className="panel"><h3>Ko‘rinish</h3><div className="sales-form"><label>Rang rejimi<select value={theme} onChange={(event) => setTheme(event.target.value)}><option value="light">Kunduzgi</option><option value="dark">Tungi</option></select></label></div></section>
    <section className="panel"><div className="erp-toolbar"><h3>Ma’lumotlarni saqlash</h3><div className="erp-actions"><button className="erp-secondary" onClick={onExcel}>Barcha ma'lumotlarni Excel yuklash</button><button className="erp-secondary" onClick={onBackup}>Zaxira nusxa yuklash (JSON)</button></div></div><p className="dashboard-source">Ma’lumotlar shu brauzerda saqlanadi. Brauzer ma’lumotlari o‘chirilsa, yozuvlar ham yo‘qoladi. Boshqa qurilmalar bilan sinxronlash va foydalanuvchi hisoblari hali ulanmagan.</p>{storageError && <Notice message={{ error: true, text: storageError }} />}</section>
  </div>;
}
