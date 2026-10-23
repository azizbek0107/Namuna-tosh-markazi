import { exportExcel } from "../../excelExport.js";
import { useState } from "react";
import { Search } from "lucide-react";
import { FinancialSummary, DataTable, TableScroll } from "../components/ErpUI.jsx";
import RevenueChart from "../components/RevenueChart.jsx";
import { dashboardPeriods, getDashboardPeriod } from "../../dashboardPeriod.js";
import { dateTime, money } from "../../erp.js";

export default function Reports({ sales, expenses, operations, now, onExcel }) {
  const [period, setPeriod] = useState("month");
  const [search, setSearch] = useState("");
  const { start, end } = getDashboardPeriod(period, now);
  const label = dashboardPeriods.find((item) => item.value === period).label;
  const inPeriod = (item) => Date.parse(item.time) >= start && Date.parse(item.time) < end;
  const periodSales = sales.filter(inPeriod);
  const filtered = periodSales.filter((sale) => `${sale.productName} ${sale.customer}`.toLocaleLowerCase("uz-UZ").includes(search.trim().toLocaleLowerCase("uz-UZ")));
  const periodExpenses = expenses.filter(inPeriod);
  const rows = operations.filter(inPeriod);
  const range = `${dateTime(start).split(",")[0]} ; ${dateTime(end - 1).split(",")[0]}`;
  return <div className="erp-page"><section className="panel erp-toolbar"><h3>Davr bo‘yicha hisobot</h3><div className="erp-actions"><select className="erp-search" aria-label="Hisobot davri" value={period} onChange={(event) => setPeriod(event.target.value)}>{dashboardPeriods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><button className="erp-secondary" onClick={() => exportExcel("sotuv-hisoboti.xlsx", ["Sana", "Mahsulot", "Xaridor", "Miqdor", "Birlik", "Tushum UZS"], periodSales.map((item) => [dateTime(item.time), item.productName, item.customer, item.quantity, item.unit, item.amount]))}>Sotuvni Excel yuklash</button><button className="erp-secondary" onClick={() => exportExcel("xarajat-hisoboti.xlsx", ["Sana", "Xarajat", "Kategoriya", "Summa UZS"], periodExpenses.map((item) => [dateTime(item.time), item.name, item.category, item.amount]))}>Xarajatni Excel yuklash</button></div></section>
    <button className="erp-secondary" onClick={onExcel}>Barcha ma’lumotlarni bitta Excel faylida yuklash</button>
    <FinancialSummary sales={periodSales} expenses={periodExpenses} />
    <RevenueChart start={start} end={end} periodLabel={label} periodRange={range} sales={sales} />
    <section className="panel"><h3>Davr natijalari</h3><p className="dashboard-source">{range} · {periodSales.length} ta sotuv · {periodExpenses.length} ta xarajat. Xarajatlar: {money(periodExpenses.reduce((sum, item) => sum + item.amount, 0))}. Tushum va xarajat farqi sof foyda hisoblanmaydi.</p></section>
    <section className="warehouse-table-panel">
      <div className="warehouse-toolbar"><h3>Sotuvlar tarixi</h3><label className="warehouse-search"><Search size={18} /><input aria-label="Sotuvlarni qidirish" placeholder="Mahsulot yoki xaridor..." value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
      <TableScroll maxRows={15} count={filtered.length}><table className="warehouse-table"><thead><tr><th>Sana</th><th>Mahsulot</th><th>Xaridor</th><th>Miqdor</th><th>Birlik narxi</th><th>Jami</th></tr></thead><tbody>
        {filtered.map((sale) => <tr key={sale.id}><td>{new Date(sale.time).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}</td><td>{sale.productName}</td><td>{sale.customer}</td><td>{sale.quantity.toLocaleString("uz-UZ")} {sale.unit}</td><td>{money(sale.price)}</td><td><strong>{money(sale.amount)}</strong></td></tr>)}
        {filtered.length === 0 && <tr><td colSpan={6} className="warehouse-empty">{periodSales.length ? "Sotuv topilmadi." : "Hozircha sotuvlar yo‘q."}</td></tr>}
      </tbody></table></TableScroll>
      <div className="warehouse-table-footer">Ko‘rsatilmoqda: {filtered.length} ta sotuv · Ma’lumotlar shu brauzerda saqlanadi.</div>
    </section>
    <h3>Amallar tarixi</h3><DataTable headings={["Sana", "Nomi", "Amal"]} count={rows.length} maxRows={15}>{rows.map((item) => <tr key={item.id}><td>{dateTime(item.time)}</td><td>{item.name}</td><td>{item.action}</td></tr>)}</DataTable>
  </div>;
}
