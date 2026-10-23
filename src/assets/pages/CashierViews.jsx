import { useState } from "react";
import { DataTable, Summary } from "../components/ErpUI.jsx";
import { money, dateTime } from "../../erp.js";
import { paymentNames, paymentOf } from "../../sales.js";
import { productCategories } from "../../catalog.js";

export function CatalogView({ products, title }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(null);
  const categories = [...new Set([...productCategories, ...products.map((item) => item.category).filter(Boolean)])];
  const rows = products.filter((item) => (category === null || item.category === category) && `${item.name} ${item.code} ${item.category}`.toLocaleLowerCase("uz-UZ").includes(search.trim().toLocaleLowerCase("uz-UZ")));
  return <div className="erp-page"><div className="erp-toolbar"><h3>{title} · Faqat ko‘rish</h3><input className="erp-search" aria-label="Mahsulot qidirish" placeholder="Nomi, ID yoki kategoriya" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="catalog-category-buttons" role="group" aria-label="Mahsulot kategoriyalari"><button type="button" className="erp-secondary" aria-pressed={category === null} onClick={() => setCategory(null)}>Barchasi</button>{categories.map((name) => <button key={name} type="button" className="erp-secondary" aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div><DataTable headings={["ID", "Mahsulot", "Kategoriya", "Qoldiq", "Sotuv narxi"]} count={rows.length}>{rows.map((item) => <tr key={item.id}><td>{item.code}</td><td>{item.name}</td><td>{item.category}</td><td>{item.quantity} {item.unit}</td><td>{money(item.salePrice ?? item.price)}</td></tr>)}</DataTable></div>;
}
export function CashierOverview({ sales, report = false }) {
  const active = sales.filter((item) => !item.cancelledAt);
  const total = (rows) => money(rows.reduce((sum, item) => sum + item.amount, 0));
  return <div className="erp-page"><h3>{report ? "Smena hisoboti" : "Mening smenam"}</h3><Summary className="cashier-summary" items={[["Savdolar", `${active.length} ta`], ["Naqd", total(active.filter((item) => paymentOf(item) === "cash"))], ["Karta", total(active.filter((item) => paymentOf(item) === "card"))], ["Qarz", total(active.filter((item) => paymentOf(item) === "debt"))]]} /><DataTable headings={["Sana", "Mahsulot", "Mijoz", "To‘lov", "Summa", "Holat"]} count={sales.length}>{sales.map((item) => <tr key={item.id}><td>{dateTime(item.time)}</td><td>{item.productName}</td><td>{item.customer}</td><td>{paymentNames[paymentOf(item)]}</td><td>{money(item.amount)}</td><td>{item.cancelledAt ? "Bekor qilingan" : "Saqlangan"}</td></tr>)}</DataTable></div>;
}
