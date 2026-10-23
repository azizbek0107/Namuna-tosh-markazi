import { exportExcel } from "../../excelExport.js";
import { useRef, useState } from "react";
import Sales from "./Sales.jsx";
import { Package, ShoppingCart } from "lucide-react";
import { DataTable, Notice, Summary } from "../components/ErpUI.jsx";
import { money, dateTime } from "../../erp.js";
import { getDashboardPeriod } from "../../dashboardPeriod.js";
import { paymentNames, paymentOf } from "../../sales.js";
import "./CashRegister.css";

const sum = (rows) => Math.round(rows.reduce((total, item) => total + item.amount, 0) * 100) / 100;
export default function CashRegister({ products, sales, expenses, shifts, user, now, onSave, onExpense, onShift, onCancel, customerOrders = [], onSaveOrder, mode = "cash", headerAside }) {
  const admin = user.role === "admin";
  const cashierSale = user.role === "cashier" && mode === "sale";
  const [saleView, setSaleView] = useState("catalog");
  const [tab, setTab] = useState(mode === "sale" ? "sale" : "history");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [payment, setPayment] = useState("all");
  const [receipt, setReceipt] = useState(null);
  const receiptRef = useRef(null);
  const [savingReceipt, setSavingReceipt] = useState(false);
  async function saveReceipt() {
    if (!receiptRef.current || savingReceipt) return;
    setSavingReceipt(true);
    try {
      const content = receiptRef.current.cloneNode(true);
      content.querySelector('.erp-actions')?.remove();
      const response = await fetch('/ntm-logo.png');
      if (!response.ok) throw new Error('Logo yuklanmadi');
      const logo = await response.blob();
      const logoData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(logo);
      });
      content.querySelector('img').src = logoData;
      const html = '<!doctype html><html lang="uz"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Savdo cheki</title><style>body{font:14px Arial,sans-serif;color:#111;background:#fff;margin:24px auto;padding:16px;max-width:420px}section{display:grid;gap:12px}p,h3{margin:0}img{display:block;width:90px;height:90px;object-fit:contain;margin:auto}hr{width:100%;border:0;border-top:1px dashed #888}</style><body>' + content.outerHTML + '</body></html>';
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `chek-${receipt.transactionId ?? receipt.id}.html`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setMessage({ error: true, text: 'Chekni saqlab bo‘lmadi. Qayta urinib ko‘ring.' });
    } finally { setSavingReceipt(false); }
  }
  const receiptLines = receipt ? sales.filter((item) => receipt.transactionId ? item.transactionId === receipt.transactionId : item.id === receipt.id) : [];
  const receiptTotal = sum(receiptLines.filter((item) => !item.cancelledAt));
  const [message, setMessage] = useState(null);
  const [expense, setExpense] = useState({ name: "", amount: "", category: "Kassa chiqimi", paymentMethod: "cash" });
  const [cancelling, setCancelling] = useState(null);
  const [reason, setReason] = useState("");
  const shift = shifts.find((item) => item.userId === user.id && !item.closedAt);
  const ownSales = sales.filter((item) => item.cashierId === user.id && item.shiftId === shift?.id && shift);
  const accessible = admin ? sales : ownSales;
  const active = accessible.filter((item) => !item.cancelledAt);
  const allActive = sales.filter((item) => !item.cancelledAt);
  const range = period === "all" ? null : getDashboardPeriod(period, now);
  const inRange = (item) => !range || (Date.parse(item.time) >= range.start && Date.parse(item.time) < range.end);
  const rows = accessible.filter((item) => inRange(item) && (payment === "all" || paymentOf(item) === payment) && `${item.productName} ${item.customer} ${item.cashierName ?? ""}`.toLocaleLowerCase("uz-UZ").includes(search.trim().toLocaleLowerCase("uz-UZ")));
  const reportSales = rows.filter((item) => !item.cancelledAt);
  const cashIn = sum(allActive.filter((item) => paymentOf(item) === "cash"));
  const cashOut = sum(expenses.filter((item) => (item.paymentMethod ?? "cash") === "cash"));
  const staff = new Map();
  reportSales.forEach((item) => {
    const key = item.cashierId ?? "legacy";
    const row = staff.get(key) ?? { name: item.cashierName ?? "Noma’lum (eski yozuv)", count: 0, amount: 0 };
    row.count++; row.amount += item.amount; staff.set(key, row);
  });
  const cards = admin ? [
    ["Kassadagi naqd qoldiq", cashIn - cashOut],
    ...[["day", "Bugungi tushum"], ["week", "Haftalik tushum"], ["month", "Oylik tushum"]].map(([key, title]) => {
      const { start, end } = getDashboardPeriod(key, now);
      return [title, sum(allActive.filter((item) => paymentOf(item) !== "debt" && Date.parse(item.time) >= start && Date.parse(item.time) < end))];
    }),
    ["Naqd tushum", cashIn], ["Karta tushumi", sum(allActive.filter((item) => paymentOf(item) === "card"))],
    ["Mijozlar qarzi", sum(allActive.filter((item) => paymentOf(item) === "debt"))], ["Jami xarajatlar", sum(expenses)],
  ] : [["Smenadagi savdo", sum(active)], ["Smenadagi savdolar soni", new Set(active.map((item) => item.transactionId ?? item.id)).size, "count"], ["Naqd qabul qilindi", sum(active.filter((item) => paymentOf(item) === "cash"))], ["Karta qabul qilindi", sum(active.filter((item) => paymentOf(item) === "card"))], ["Qarzga sotildi", sum(active.filter((item) => paymentOf(item) === "debt"))]];
  return <div className="erp-page cash-register">
    <div className={cashierSale ? "cashier-sale-header" : headerAside ? "cash-session-row" : undefined}>{headerAside}
    <section className="panel erp-toolbar"><div><h3>{admin ? "Admin kassasi" : "Kassir kassasi"}</h3><p className="dashboard-source">{shift ? `Smena ochilgan: ${dateTime(shift.openedAt)}` : "Smena yopiq. Sotuv uchun smenani oching."}</p></div><button className="erp-secondary" onClick={() => onShift(Boolean(shift))}>{shift ? "Smenani yopish" : "Smenani ochish"}</button></section>
    {cashierSale && <>
      <button type="button" id="cashier-products-title" className="panel cashier-sale-title" aria-pressed={saleView === "catalog"} aria-controls="sales-products-panel" onClick={() => setSaleView("catalog")}><Package size={22} aria-hidden="true" /><span>Mahsulotlar</span></button>
      <button type="button" id="cashier-new-sale-title" className="panel cashier-sale-title" aria-pressed={saleView === "order"} aria-controls="sales-order-panel" onClick={() => setSaleView("order")}><ShoppingCart size={22} aria-hidden="true" /><span>Yangi sotuv</span></button>
    </>}
    </div>
    {mode === "cash" && <><Summary className={admin ? "" : "cashier-summary"} items={[["Jami sotuvlar", `${active.length} ta`], ["Jami tushum", money(sum(active))], ["Sotish mumkin bo'lgan mahsulotlar", `${products.filter((item) => item.quantity > 0).length} ta`], ...(!admin ? [["Smenadagi savdo", money(sum(active))]] : [])]} /><div className={`cash-stats${admin ? "" : " cashier-stats"}`}>{(admin ? cards : cards.slice(1)).map(([title, value, type]) => <article className="panel" key={title}><span>{title}</span><strong>{type === "count" ? `${value} ta` : money(value)}</strong></article>)}</div>
    {admin && <p className="dashboard-source">Qoldiq 0 so‘m boshlang‘ich mablag‘dan, qayd etilgan naqd tushum va naqd chiqimlardan hisoblanadi. Eski savdolarda to‘lov turi va xodim belgilanmagan; ular naqd qoldiqqa qo‘shilmaydi. Ma’lumotlar shu brauzerda saqlanadi.</p>}
    {admin && <div className="erp-actions cash-tabs">{[["history", "Savdolar va hisobot"], ["expense", "Xarajat va chiqim"], ["staff", "Xodimlar va smenalar"]].map(([key, title]) => <button className="erp-secondary" aria-pressed={tab === key} key={key} onClick={() => setTab(key)}>{title}</button>)}</div>}
    </>}
    <Notice message={message} />
    {mode === "sale" && <Sales key={user.id} draftStorageKey={cashierSale ? `ntm-closed-customers:${user.id}` : undefined} onViewChange={setSaleView} products={products} now={now} view={cashierSale ? saleView : "split"} showCategories={user.role === "cashier"} headingsInHeader={cashierSale} cartProductCards={cashierSale} quickSearchDisabled={Boolean(receipt)} onSaveOrder={onSaveOrder} disabled={!shift} onSave={(draft) => onSave(draft, setReceipt)} />}
    {mode === "cash" && (tab === "history" || tab === "staff") && <>
      <section className="panel erp-toolbar"><h3>Kassa hisoboti</h3><div className="erp-actions">
        <select className="erp-search" aria-label="Kassa hisoboti davri" value={period} onChange={(event) => setPeriod(event.target.value)}>{[["all", "Barcha davr"], ["day", "Bugun"], ["week", "Shu hafta"], ["month", "Shu oy"]].map(([value, title]) => <option value={value} key={value}>{title}</option>)}</select>
        <select className="erp-search" aria-label="To‘lov turi" value={payment} onChange={(event) => setPayment(event.target.value)}><option value="all">Barcha to‘lovlar</option>{Object.entries(paymentNames).map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select>
        <input className="erp-search" aria-label="Kassa savdolarini qidirish" placeholder="Mahsulot, mijoz yoki xodim" value={search} onChange={(event) => setSearch(event.target.value)} />
        <button className="erp-secondary" onClick={() => exportExcel("kassa-hisoboti.xlsx", ["Sana", "Mahsulot", "Mijoz", "Xodim", "To‘lov", "Summa", "Holat"], rows.map((item) => [dateTime(item.time), item.productName, item.customer, item.cashierName ?? "Noma’lum", paymentNames[paymentOf(item)], item.amount, item.cancelledAt ? "Bekor qilingan" : "Saqlangan"]))}>Excel yuklash</button>
      </div><p className="dashboard-source">Faol savdolar: {reportSales.length} ta · Jami: {money(sum(reportSales))}</p></section>
      {tab === "history" && <DataTable headings={["Sana", "Mahsulot / miqdor", "Mijoz", "Xodim", "To‘lov", "Summa", "Holat / amal"]} count={rows.length}>{rows.map((item) => <tr key={item.id}><td>{dateTime(item.time)}</td><td>{item.productName}<br />{item.quantity} {item.unit}</td><td>{item.customer}</td><td>{item.cashierName ?? "Noma’lum"}</td><td>{paymentNames[paymentOf(item)]}</td><td>{money(item.amount)}</td><td>{item.cancelledAt ? <span>Bekor qilingan: {item.cancelReason}<br />{item.cancelledBy} · {dateTime(item.cancelledAt)}</span> : <><button className="text-button" onClick={() => setReceipt(item)}>Chek</button>{admin && <button className="text-button" onClick={() => { setCancelling(item.id); setReason(""); }}>Bekor qilish</button>}</>}</td></tr>)}</DataTable>}
      {tab === "staff" && <><DataTable headings={["Xodim", "Savdolar soni", "Savdo summasi"]} count={staff.size}>{[...staff].map(([key, item]) => <tr key={key}><td>{item.name}</td><td>{item.count}</td><td>{money(item.amount)}</td></tr>)}</DataTable><h3>Smenalar tarixi</h3><DataTable headings={["Xodim", "Ochildi", "Yopildi", "Savdo summasi"]} count={shifts.length}>{shifts.map((item) => <tr key={item.id}><td>{item.name}</td><td>{dateTime(item.openedAt)}</td><td>{item.closedAt ? dateTime(item.closedAt) : "Ochiq"}</td><td>{money(sum(allActive.filter((sale) => sale.shiftId === item.id)))}</td></tr>)}</DataTable></>}
    </>}
    {mode === "cash" && <><h3>Buyurtmalar</h3><DataTable headings={["Buyurtma kuni", "Mijoz", "Telefon", "Yaqin qarindoshi", "Qarindoshining telefoni", "Mahsulotlar", "Xizmat", "Jami"]} count={customerOrders.filter((order) => admin || order.cashierId === user.id).length} empty="Hozircha buyurtmalar yo‘q.">{customerOrders.filter((order) => admin || order.cashierId === user.id).map((order) => <tr key={order.id}><td>{order.orderDate}{order.orderTime && <> ? {order.orderTime}</>}{order.deliveryDate && <><br /><small>Yetkazish: {order.deliveryDate} {order.deliveryTime}</small></>}</td><td>{order.firstName} {order.lastName}</td><td>{order.phone}</td><td>{order.relativeFirstName} {order.relativeLastName}</td><td>{order.relativePhone}</td><td>{order.items.map((item) => <div key={item.id}>{item.productName}: {item.quantity} {item.unit} × {money(item.price)}</div>)}</td><td>{order.includeService ? <>{order.serviceName || "Bor"}{order.servicePrice != null && <><br />{money(order.servicePrice)}</>}</> : "Yo'q"}</td><td>{money(order.total)}</td></tr>)}</DataTable></>}
    {mode === "cash" && admin && tab === "expense" && <><section className="panel"><h3>Kassadan chiqim kiritish</h3><form className="sales-form" onSubmit={(event) => { event.preventDefault(); const error = onExpense(expense); setMessage({ error: Boolean(error), text: error || "Chiqim saqlandi." }); if (!error) setExpense({ ...expense, name: "", amount: "" }); }}>
      <label>Chiqim sababi<input required maxLength={150} value={expense.name} onChange={(event) => setExpense({ ...expense, name: event.target.value })} /></label><label>Summa<input required type="number" min="0.01" step="0.01" value={expense.amount} onChange={(event) => setExpense({ ...expense, amount: event.target.value })} /></label><label>Manba<select value={expense.paymentMethod} onChange={(event) => setExpense({ ...expense, paymentMethod: event.target.value })}><option value="cash">Naqd kassa</option><option value="card">Karta</option></select></label><button className="erp-secondary">Chiqimni saqlash</button>
    </form></section><DataTable headings={["Sana", "Sabab", "Manba", "Summa"]} count={expenses.length}>{expenses.map((item) => <tr key={item.id}><td>{dateTime(item.time)}</td><td>{item.name}</td><td>{paymentNames[item.paymentMethod ?? "cash"]}</td><td>{money(item.amount)}</td></tr>)}</DataTable></>}
    {admin && cancelling && <section className="panel"><h3>Xato savdoni bekor qilish</h3><p className="dashboard-source">Mahsulot omborga qaytadi, savdo tushumdan ayriladi. Yozuv va sabab tarixda qoladi.</p><form className="sales-form" onSubmit={(event) => { event.preventDefault(); const error = onCancel(cancelling, reason); setMessage({ error: Boolean(error), text: error || "Savdo bekor qilindi." }); if (!error) setCancelling(null); }}><label>Sabab<input required maxLength={300} value={reason} onChange={(event) => setReason(event.target.value)} /></label><div className="erp-actions"><button className="erp-secondary">Bekor qilishni tasdiqlash</button><button className="erp-secondary" type="button" onClick={() => setCancelling(null)}>Yopish</button></div></form></section>}
    {receipt && <section ref={receiptRef} className="panel cash-receipt" role="dialog" aria-label="Sotuv cheki"><img className="cash-receipt-logo" src="/ntm-logo.png" alt="Korxona logotipi" /><p>Savdo cheki · {receipt.transactionId ?? receipt.id}</p><p>{dateTime(receipt.time)}</p><p>Kassir: {receipt.cashierName ?? "Noma’lum"}</p><p>Mijoz: {receipt.customer}</p><hr /><div>{receiptLines.map((item) => <p key={item.id}>{item.productName} · {item.quantity} {item.unit} × {money(item.price)} = {money(item.amount)}{item.cancelledAt && <strong> (Bekor qilingan)</strong>}</p>)}</div><h3>Jami: {money(receiptTotal)}</h3><p>{paymentNames[paymentOf(receipt)]}</p><small>Ichki savdo cheki. Fiskal chek emas.</small><div className="erp-actions"><button className="erp-secondary" onClick={() => window.print()}>Chekni chop etish</button><button className="erp-secondary" disabled={savingReceipt} onClick={saveReceipt}>Saqlash</button><button className="erp-secondary" onClick={() => setReceipt(null)}>Yopish</button></div></section>}
  </div>;
}
