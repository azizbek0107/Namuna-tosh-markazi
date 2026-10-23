import { useAttendance } from "./useAttendance.js";
import { prepareCustomerOrder } from "./customerOrders.js";
import Attendance, { AttendanceControl } from "./assets/components/Attendance.jsx";
import { downloadExcel, inventorySheets } from "./excelExport.js";
import RevenueChart from "./assets/components/RevenueChart.jsx";
import ProductSalesChart from "./assets/components/ProductSalesChart.jsx";
import AccountSettings from "./assets/components/AccountSettings.jsx";
import { loadAccount } from "./account.js";
import { AuthGate, UserAccess } from "./Auth.jsx";
import { canAccessPage, ownShiftSales, canCompleteOrder } from "./permissions.js";
import { CatalogView, CashierOverview } from "./assets/pages/CashierViews.jsx";
import { roleNames, authRequest } from "./authApi.js";
import Warehouse from "./assets/pages/Warehouse.jsx";
import Products from "./assets/pages/Products.jsx";
import CashRegister from "./assets/pages/CashRegister.jsx";
import Production from "./assets/pages/Production.jsx";
import Finance from "./assets/pages/Finance.jsx";
import Employees from "./assets/pages/Employees.jsx";
import Reports from "./assets/pages/Reports.jsx";
import SettingsPage from "./assets/pages/Settings.jsx";
import { completeProduction, getUsedProducts, getProducedProducts } from "./erp.js";
import { recordCart, cancelSale } from "./sales.js";
import { initialProducts } from "./initialProducts.js";
import { getLowStockProducts, normalizeStockProducts } from "./stock.js";
import { normalizeCatalogProducts, prepareProduct } from "./catalog.js";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./useTheme.js";
import { dashboardPeriods, getDashboardPeriod } from "./dashboardPeriod.js";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Factory,
  Wallet,
  Users,
  ChartNoAxesCombined,
  Settings,
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  { name: "Asosiy oyna", icon: LayoutDashboard },
  { name: "Savdo", icon: ShoppingCart },
  { name: "Kassa", icon: ShoppingCart },
  { name: "Ishlab chiqarish", icon: Factory },
  { name: "Mahsulotlar", icon: Tags },
  { name: "Ombor", icon: Package },
  { name: "Moliya", icon: Wallet },
  { name: "Xodimlar", icon: Users },
  { name: "Hisobotlar", icon: ChartNoAxesCombined },
  { name: "Sozlamalar", icon: Settings },
];

const defaultInventory = { products: normalizeCatalogProducts(normalizeStockProducts(initialProducts)), operations: [], sales: [], production: [], expenses: [], employees: [], settings: { company: "StoneX", admin: "Administrator", phone: "" } };
function loadInventory() {
  try {
    const saved = localStorage.getItem("stonex-erp-v1");
    if (!saved) return { data: defaultInventory, error: "" };
    const data = JSON.parse(saved);
    const numericFields = { products: ["quantity", "price"], sales: ["quantity", "price", "amount"], expenses: ["amount"], employees: ["salary"], production: ["input", "output"], operations: [] };
    for (const [key, fields] of Object.entries(numericFields)) {
      if (!Array.isArray(data[key]) || data[key].some((item) => !item || !["string", "number"].includes(typeof item.id) || fields.some((field) => !Number.isFinite(item[field]) || item[field] < 0))) throw new Error("Invalid saved data");
    }
    if (data.products.some((item) => typeof item.name !== "string" || typeof item.category !== "string" || typeof item.unit !== "string") ||
        data.sales.some((item) => typeof item.productName !== "string" || typeof item.customer !== "string" || !Number.isFinite(Date.parse(item.time))) ||
        data.operations.some((item) => typeof item.name !== "string" || typeof item.action !== "string" || !Number.isFinite(Date.parse(item.time))) ||
        data.employees.some((item) => typeof item.name !== "string" || typeof item.role !== "string") ||
        data.expenses.some((item) => typeof item.name !== "string" || !Number.isFinite(Date.parse(item.time))) ||
        data.production.some((item) => typeof item.name !== "string" || !Number.isFinite(Date.parse(item.time))) ||
        typeof data.settings?.company !== "string" || typeof data.settings?.admin !== "string" || typeof data.settings?.phone !== "string") throw new Error("Invalid saved data");
    return { data: { ...data, products: normalizeCatalogProducts(normalizeStockProducts(data.products, initialProducts)) }, error: "" };
  } catch {
    return { data: defaultInventory, error: "Saqlangan ma’lumotlarni o‘qib bo‘lmadi. Eski yozuvlar ustiga yozilmaydi; yangi o‘zgarishlarni JSON zaxiraga yuklab oling." };
  }
}

function Workspace({ user, onLogout, theme, setTheme }) {
  const isAdmin = user.role === "admin";
  const allowedMenu = menuItems.filter((item) => canAccessPage(user.role, item.name));
  const [bonuses, setBonuses] = useState([]);
  const [bonusError, setBonusError] = useState("");
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    const refresh = () => authRequest("bonuses").then((data) => { if (!cancelled) { setBonuses(data.bonuses); setBonusError(""); } }).catch((error) => { if (!cancelled) setBonusError(error.message); });
    refresh(); const timer = setInterval(refresh, 30000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [isAdmin]);
  async function saveBonus(draft) {
    const data = await authRequest("bonuses", draft); setBonuses(data.bonuses); setBonusError("");
  }
  const attendanceState = useAttendance(user.id);
  const { attendance, marks: attendanceMarks, schedule: attendanceSchedule, error: attendanceError, busy: attendanceBusy } = attendanceState;
  async function markAttendance(draft) {
    const data = await authRequest("attendance/mark", draft);
    await attendanceState.refresh();
    return data;
  }
  async function recordAttendance(action) {
    try { await attendanceState.mutate("", { action }); } catch { /* Error is displayed beside the buttons. */ }
  }
  const employeeEditor = useRef(null);
  const [workers, setWorkers] = useState([]);
  useEffect(() => {
    if (!isAdmin) return;
    const controller = new AbortController();
    authRequest("users").then(({ users }) => { if (!controller.signal.aborted) setWorkers(users.filter((item) => item.role === "worker")); }).catch(() => {});
    return () => controller.abort();
  }, [isAdmin]);
  const [account, setAccount] = useState(() => ({ ...loadAccount(), login: user.login, serverAuth: true }));
  const [loaded] = useState(loadInventory);
  const [inventory, setInventory] = useState(loaded.data);
  const [storageError, setStorageError] = useState(loaded.error);
  const { products, operations, sales: allSales, production, expenses, employees, settings } = inventory;
  const sales = allSales.filter((sale) => !sale.cancelledAt);
  useEffect(() => {
    if (loaded.error) return;
    let error = "";
    try { localStorage.setItem("stonex-erp-v1", JSON.stringify(inventory)); }
    catch { error = "Brauzerda saqlash imkoni yo‘q yoki xotira to‘lgan. Zaxira nusxani yuklab oling."; }
    queueMicrotask(() => setStorageError(error));
  }, [inventory, loaded.error]);
  const [period, setPeriod] = useState("day");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const { start, end } = getDashboardPeriod(period, now);
  const todayRange = getDashboardPeriod("day", now);
  const dailyUsedProducts = getUsedProducts(production, todayRange.start, todayRange.end);
  const dailyProducedProducts = getProducedProducts(production, todayRange.start, todayRange.end);
  const lowStockProducts = getLowStockProducts(products);
  const periodLabel = dashboardPeriods.find((item) => item.value === period).label;
  const formatDate = (time) => new Date(time).toLocaleDateString("uz-UZ", { timeZone: "Asia/Tashkent" });
  const periodRange = `${formatDate(start)} ; ${formatDate(end - 1)}`;
  const formatMoney = (value) => value.toLocaleString("uz-UZ") + " so'm";
  const statistics = [
    { title: `${periodLabel} sotuv tushumi`, value: formatMoney(sales.filter((sale) => Date.parse(sale.time) >= start && Date.parse(sale.time) < end).reduce((sum, sale) => sum + sale.amount, 0)), note: periodRange, icon: ShoppingCart },
    { title: "Bugun ishlatilgan mahsulotlar", items: dailyUsedProducts, empty: "Bugun hali mahsulot ishlatilmagan.", note: "Bugun yakunlangan ishlab chiqarish bo‘yicha", icon: Package },
    { title: "Bugun ishlab chiqarilgan mahsulotlar", items: dailyProducedProducts, empty: "Bugun hali mahsulot ishlab chiqarilmagan.", note: "Bugun omborga qo‘shilgan tayyor mahsulotlar", icon: Factory },
    { title: "30% dan kam qolgan mahsulotlar", items: lowStockProducts, empty: "Qoldig‘i 30% dan kam mahsulot yo‘q.", note: "To‘liq zaxira miqdoriga nisbatan", icon: Package },
  ];

  function saveProduct(product, editing) {
    if (!isAdmin) return "Faqat admin mahsulotni o'zgartira oladi.";
    const result = prepareProduct(product, products, editing ? product.id : null);
    if (result.error) return result.error;
    const savedProduct = result.product;
    const operation = { id: crypto.randomUUID(), name: savedProduct.name, action: editing ? "Tahrirlandi" : "Qo'shildi", time: new Date().toISOString() };
    setInventory((current) => ({
      ...current,
      products: editing ? current.products.map((item) => item.id === savedProduct.id ? savedProduct : item) : [...current.products, savedProduct],
      operations: [operation, ...current.operations],
    }));
    return null;
  }

  function deleteProduct(id) {
    if (!isAdmin) return "Ruxsat yo'q.";
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const operation = { id: crypto.randomUUID(), name: product.name, action: "O'chirildi", time: new Date().toISOString() };
    setInventory((current) => ({ ...current, products: current.products.filter((item) => item.id !== id), operations: [operation, ...current.operations] }));
  }

  function saveSale(draft, onSaved) {
    const id = crypto.randomUUID();
    const time = new Date().toISOString();
    if (!["admin", "cashier"].includes(user.role)) return "Ruxsat yo'q.";
    const shift = (inventory.shifts ?? []).find((item) => item.userId === user.id && !item.closedAt);
    if (!shift) return "Avval smenani oching.";
    draft = { ...draft, shiftId: shift.id };
    const result = recordCart(inventory, draft, id, time, user);
    if (result.error) return result.error;
    setInventory((current) => recordCart(current, draft, id, time, user).inventory ?? current);
    setNow(Date.now());
    onSaved?.(result.inventory.sales.find((sale) => sale.transactionId === id));
    return null;
  }

  function saveCustomerOrder(draft) {
    const result = prepareCustomerOrder(inventory, draft, user, crypto.randomUUID(), new Date().toISOString());
    if (result.error) return result.error;
    setInventory((current) => ({ ...current, customerOrders: [result.order, ...(current.customerOrders ?? [])] }));
    return null;
  }

  function addProduction(draft) {
    if (!isAdmin) return "Faqat admin topshiriq yarata oladi.";
    const assignee = workers.find((item) => item.id === draft.assigneeId);
    if (draft.assigneeId && !assignee) return "Ishchi akkauntini tanlang.";
    const source = products.find((item) => String(item.id) === draft.sourceId);
    const target = products.find((item) => String(item.id) === draft.targetId);
    const input = Number(draft.input), output = Number(draft.output);
    if (!draft.name.trim() || !source || !target || source.id === target.id) return "Nom, xomashyo va boshqa tayyor mahsulotni tanlang.";
    if (![input, output].every((value) => Number.isFinite(value) && value > 0)) return "Miqdorlar noldan katta bo‘lishi kerak.";
    if ((source.unit === "dona" && !Number.isInteger(input)) || (target.unit === "dona" && !Number.isInteger(output))) return "Dona miqdori butun son bo‘lishi kerak.";
    const order = { id: crypto.randomUUID(), time: new Date().toISOString(), name: draft.name.trim(), sourceId: source.id, targetId: target.id, sourceName: source.name, targetName: target.name, sourceUnit: source.unit, targetUnit: target.unit, input, output, assigneeId: assignee?.id ?? null, assigneeName: assignee?.name ?? "Biriktirilmagan", status: "Jarayonda" };
    setInventory((current) => ({ ...current, production: [order, ...current.production] }));
    return null;
  }

  function finishProduction(id) {
    if (!canCompleteOrder(user, production.find((item) => item.id === id))) return "Bu topshiriqni yakunlashga ruxsat yo'q.";
    const time = new Date().toISOString();
    const result = completeProduction(inventory, id, time);
    if (result.error) return result.error;
    setInventory((current) => completeProduction(current, id, time).state ?? current);
    setNow(Date.now());
    return null;
  }

  function addExpense(draft) {
    if (!isAdmin) return "Faqat admin xarajat kirita oladi.";
    const amount = Number(draft.amount);
    if (!draft.name.trim() || !Number.isFinite(amount) || amount <= 0) return "Xarajat nomi va musbat summani kiriting.";
    const expense = { id: crypto.randomUUID(), time: new Date().toISOString(), name: draft.name.trim(), category: draft.category, paymentMethod: draft.paymentMethod ?? "cash", amount: Math.round(amount * 100) / 100 };
    setInventory((current) => ({ ...current, expenses: [expense, ...current.expenses], operations: [{ id: expense.id, time: expense.time, name: expense.name, action: "Xarajat kiritildi" }, ...current.operations] }));
    return null;
  }

  function saveEmployee(draft, editingId) {
    const salary = Number(draft.salary);
    if (!draft.name.trim() || !draft.role.trim() || draft.salary === "" || !Number.isFinite(salary) || salary < 0) return "Ism, lavozim va to‘g‘ri ish haqini kiriting.";
    const employee = { id: editingId ?? crypto.randomUUID(), name: draft.name.trim(), role: draft.role.trim(), phone: draft.phone.trim(), salary, status: draft.status };
    setInventory((current) => ({ ...current, employees: editingId ? current.employees.map((item) => item.id === editingId ? employee : item) : [...current.employees, employee] }));
    return null;
  }

  function downloadBackup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(inventory, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "stonex-zaxira.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const [selectedPage, setActivePage] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`stonex-active-page:${user.id}`);
      if (allowedMenu.some((item) => item.name === saved)) return saved;
    } catch { /* Use the first allowed page when browser storage is unavailable. */ }
    return allowedMenu[0].name;
  });
  const activePage = allowedMenu.some((item) => item.name === selectedPage) ? selectedPage : allowedMenu[0].name;
  useEffect(() => {
    try { sessionStorage.setItem(`stonex-active-page:${user.id}`, activePage); }
    catch { /* Navigation remains available without browser storage. */ }
  }, [activePage, user.id]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [warehouseCategory, setWarehouseCategory] = useState("Barchasi");
  const [readNotifications, setReadNotifications] = useState([]);
  const [openedNotification, setOpenedNotification] = useState(null);
  const searchPanel = useRef(null);
  const notificationsPanel = useRef(null);
  const periodPanel = useRef(null);
  useEffect(() => {
    function closeOutsidePanels(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest("[popovertarget]");
      if (!target.closest("#main-sidebar") && !target.closest('[aria-controls="main-sidebar"]')) {
        setSidebarOpen(false);
      }
      for (const ref of [searchPanel, notificationsPanel, periodPanel]) {
        const panel = ref.current;
        if (panel?.matches(":popover-open") && !panel.contains(target) &&
            trigger?.getAttribute("popovertarget") !== panel.id) {
          panel.hidePopover();
        }
      }
    }
    document.addEventListener("pointerdown", closeOutsidePanels, true);
    return () => document.removeEventListener("pointerdown", closeOutsidePanels, true);
  }, []);
  const normalizedQuery = query.trim().toLocaleLowerCase("uz-UZ");
  const matchingPages = allowedMenu.filter((item) => item.name.toLocaleLowerCase("uz-UZ").includes(normalizedQuery));
  const matchingProducts = products.filter((product) => `${product.name} ${product.code}`.toLocaleLowerCase("uz-UZ").includes(normalizedQuery));
  const notifications = [
    ...attendance.filter((item) => !item.cancelledAt).flatMap((item) => [
      { id: item.id + "-arrive", text: item.name + " ishga keldi", time: item.arrivedAt },
      ...(item.leftAt ? [{ id: item.id + "-leave", text: item.name + " ishdan ketdi", time: item.leftAt }] : []),
    ]).sort((a, b) => Date.parse(b.time) - Date.parse(a.time)),
    { id: "bell-preview", text: "Sinov xabari: qo‘ng‘iroq animatsiyasi ishlayapti. Xabar o‘qilgan deb belgilanganda tebranish to‘xtaydi.", test: true },
    ...products.filter((product) => product.quantity === 0).map((product) => ({
      id: `empty-${product.id}`, text: `${product.name}: omborda qolmagan`, productName: product.name,
    })),
    ...operations.map((operation) => ({ id: operation.id, text: `${operation.name}: ${operation.action}`, time: operation.time })),
  ].filter((item) => !readNotifications.includes(item.id));
  const unreadCount = notifications.length;

  function markNotificationRead(id) {
    setReadNotifications((current) => current.includes(id) ? current : [...current, id]);
    setOpenedNotification((current) => current?.id === id ? null : current);
  }

  function openSearchResult(page, productName = "") {
    if (!allowedMenu.some((item) => item.name === page)) return;
    setActivePage(page);
    setWarehouseSearch(productName);
    setWarehouseCategory("Barchasi");
    setSidebarOpen(false);
    searchPanel.current?.hidePopover();
    notificationsPanel.current?.hidePopover();
  }

  return (
    <div className="app">
      <aside id="main-sidebar" inert={!sidebarOpen} className={`sidebar ${sidebarOpen ? "" : "sidebar-closed"}`}>
        <button type="button" className="brand" onClick={() => setSidebarOpen(false)} aria-label={`${settings.company} — menyuni yopish`}>
          <div className="brand-icon">
            <img src="/ntm-logo.png" alt="NTM logotipi" width="48" height="48" />
          </div>
          <div>
            <strong>{settings.company}</strong>
          </div>
        </button>

        <div className="menu-label">ASOSIY MENYU</div>

        <nav className="navigation">
          {allowedMenu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  setSidebarOpen(false);
                }}
                aria-current={activePage === item.name ? "page" : undefined}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-avatar">{account.avatar ? <img src={account.avatar} alt="" /> : settings.admin.slice(0, 1).toUpperCase()}</div>
          <div className="admin-info">
            <strong>{user.name}</strong>
            <span>{roleNames[user.role]}</span>
          </div>
          <button type="button" className="auth-logout sidebar-logout" onClick={onLogout}>Chiqish</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className={`icon-button menu-trigger${sidebarOpen ? " menu-trigger-hidden" : ""}`}
            inert={sidebarOpen}
            aria-hidden={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
            aria-expanded={sidebarOpen}
            aria-controls="main-sidebar"
            aria-label="Menyuni ochish yoki yopish"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            Bosh sahifa <span>/</span> <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <span className="session-role">{user.name} · {roleNames[user.role]}</span>
            <button type="button" className={`icon-button theme-toggle ${theme === "dark" ? "is-dark" : ""}`} onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Kunduzgi rejimga o‘tish" : "Tungi rejimga o‘tish"}
              title={theme === "dark" ? "Kunduzgi rejim" : "Tungi rejim"} aria-pressed={theme === "dark"}>
              <span className="theme-toggle-window" aria-hidden="true">
                <Sun size={20} className="theme-toggle-sun" />
                <Moon size={20} className="theme-toggle-moon" />
              </span>
            </button>
            {activePage === "Asosiy oyna" && <button className="icon-button" aria-label="Qidirish" popoverTarget="global-search">
              <Search size={20} />
            </button>}

            {isAdmin && <button className={`icon-button notification ${unreadCount > 0 ? "has-unread" : ""}`} aria-label={`Bildirishnomalar: ${unreadCount} ta o‘qilmagan`} popoverTarget="global-notifications">
              <Bell size={20} className="notification-bell" aria-hidden="true" />
              {unreadCount > 0 && <span />}
            </button>}

            {isAdmin && activePage === "Asosiy oyna" && <AccountSettings account={account} name={settings.admin} onSave={(value, name) => {
              setAccount(value);
              setInventory((current) => ({ ...current, settings: { ...current.settings, admin: name } }));
            }} />}
          </div>
        </header>

        {isAdmin && <section id="global-search" className="topbar-popover" popover="auto" ref={searchPanel} aria-labelledby="search-title">
          <div className="popover-heading">
            <h2 id="search-title">Qidirish</h2>
            <button type="button" popoverTarget="global-search" popoverTargetAction="hide" aria-label="Qidiruvni yopish">Yopish</button>
          </div>
          <label className="global-search-label">
            Bo‘lim yoki mahsulot nomi
            <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Masalan: Ombor yoki Granit" />
          </label>
          <div className="popover-results" aria-live="polite">
            <h3>Bo‘limlar</h3>
            {matchingPages.map((item) => <button className="popover-result" key={item.name} onClick={() => openSearchResult(item.name)}>{item.name}</button>)}
            <h3>Mahsulotlar</h3>
            {matchingProducts.map((product) => <button className="popover-result" key={product.id} onClick={() => openSearchResult("Ombor", product.name)}><strong>{product.name}</strong><small>{product.quantity.toLocaleString("uz-UZ")} {product.unit} · {formatMoney(product.price)}</small></button>)}
            {matchingPages.length === 0 && matchingProducts.length === 0 && <p>Hech narsa topilmadi.</p>}
          </div>
        </section>}

        {isAdmin && <section id="global-notifications" className="topbar-popover" popover="auto" ref={notificationsPanel} aria-labelledby="notifications-title">
          <div className="popover-heading">
            <h2 id="notifications-title">Bildirishnomalar</h2>
            <button type="button" popoverTarget="global-notifications" popoverTargetAction="hide" aria-label="Bildirishnomalarni yopish">Yopish</button>
          </div>
          {unreadCount > 0 && <button className="text-button" onClick={() => {
            setReadNotifications((current) => [...new Set([...current, ...notifications.map((item) => item.id)])]);
            setOpenedNotification(null);
          }}>Barchasini o‘qilgan deb belgilash ({unreadCount})</button>}
          {openedNotification ? <article className="notification-detail">
            <button className="text-button" onClick={() => setOpenedNotification(null)}>← Xabarlar ro‘yxatiga</button>
            <h3>Xabar</h3>
            <p>{openedNotification.text}</p>
            {openedNotification.time && <small>{new Date(openedNotification.time).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}</small>}
            <button className="notification-action" disabled={readNotifications.includes(openedNotification.id)} onClick={() => markNotificationRead(openedNotification.id)}>{readNotifications.includes(openedNotification.id) ? "O‘qilgan" : "O‘qilgan deb belgilash"}</button>
          </article> : <div className="popover-results">
            {notifications.length === 0 ? <p>Hozircha bildirishnomalar yo‘q. Ombordagi yangi amallar shu yerda ko‘rinadi.</p> : notifications.map((item) => (
              <article className={`popover-result notification-card ${readNotifications.includes(item.id) ? "" : "unread"}`} key={item.id}>
                <strong>{item.text}</strong>
                {item.time && <small>{new Date(item.time).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}</small>}
                <div className="notification-actions">
                  <button type="button" className="notification-action" onClick={() => setOpenedNotification(item)}>Xabarni ochish</button>
                  <button type="button" className="notification-action" disabled={readNotifications.includes(item.id)} onClick={() => markNotificationRead(item.id)}>{readNotifications.includes(item.id) ? "O‘qilgan" : "O‘qilgan deb belgilash"}</button>
                </div>
              </article>
            ))}
          </div>}
        </section>}

        <section className={`page-content${activePage === "Asosiy oyna" ? " dashboard-bordered" : ""}`}>
          <div className="page-heading">
            <div>
              <h1>{activePage}</h1>
            </div>

            {isAdmin && activePage === "Xodimlar" && <button type="button" className="warehouse-add-btn" onClick={() => employeeEditor.current?.openAdd()}>Xodim qo‘shish</button>}
            {isAdmin && activePage === "Asosiy oyna" && <div className="period-control">
              <span id="period-label">Hisobot davri</span>
              <button type="button" className="date-badge period-trigger" popoverTarget="period-options" aria-label={`Hisobot davri: ${periodLabel}`} onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const panel = periodPanel.current;
                panel.style.top = `${rect.bottom + 8}px`;
                panel.style.left = `${Math.max(8, Math.min(rect.right - 180, window.innerWidth - 188))}px`;
              }}>
                {periodLabel}<ChevronDown size={14} aria-hidden="true" />
              </button>
              <div id="period-options" className="period-options" popover="auto" ref={periodPanel} aria-labelledby="period-label">
                {dashboardPeriods.map((item) => <button type="button" key={item.value} aria-pressed={period === item.value} onClick={() => {
                  setPeriod(item.value);
                  setNow(Date.now());
                  periodPanel.current.hidePopover();
                }}>{item.label}</button>)}
              </div>
              <small>{periodRange}</small>
            </div>}
          </div>

          {!isAdmin && activePage === "Asosiy oyna" && <AttendanceControl now={now} schedule={attendanceSchedule} loaded={attendanceState.loaded} onRetry={attendanceState.refresh} rows={attendance} onRecord={recordAttendance} busy={attendanceBusy} error={attendanceError} />}
          {storageError && <p className="sales-message sales-error" role="alert">{storageError}</p>}

          {activePage === "Asosiy oyna" && !isAdmin ? (
            <CashierOverview sales={ownShiftSales(allSales, inventory.shifts ?? [], user.id)} />
          ) : activePage === "Asosiy oyna" ? (
            <>
              <div className="stats-grid" aria-live="polite">
                {statistics.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article className="stat-card" key={stat.title}>
                      <div className="stat-top">
                        <span>{stat.title}</span>
                        <div className="stat-icon">
                          <Icon size={21} />
                        </div>
                      </div>

                      {stat.items ? (
                        stat.items.length > 0 ? <ul className="daily-used-products" aria-label={stat.title}>
                          {stat.items.map((item) => <li key={item.key}><span>{item.name}</span><strong>{item.quantity.toLocaleString("uz-UZ", { maximumFractionDigits: 9 })} {item.unit}{item.percentage !== undefined && <small className="low-stock-percentage">{(Math.floor(item.percentage * 100) / 100).toLocaleString("uz-UZ", { maximumFractionDigits: 2 })}% qoldi</small>}</strong></li>)}
                        </ul> : <p className="daily-used-empty">{stat.empty}</p>
                      ) : <h2>{stat.value}</h2>}

                      <p className="change-label">{stat.note}</p>
                    </article>
                  );
                })}
              </div>

              <div className="content-grid">
                <RevenueChart start={start} end={end} periodLabel={periodLabel} periodRange={periodRange} sales={sales} />

                <ProductSalesChart start={start} end={end} periodLabel={periodLabel} periodRange={periodRange} sales={sales} />
              </div>
              <Attendance schedule={attendanceSchedule} marks={attendanceMarks} onMutate={attendanceState.mutate} busy={attendanceBusy} rows={attendance} employees={employees} now={now} error={attendanceError} />
            </>
          ) : activePage === "Mahsulotlar" ? (
            isAdmin ? <Products products={products} onSaveProduct={saveProduct} onDeleteProduct={deleteProduct} /> : <CatalogView products={products} title="Mahsulotlar" />
          ) : (activePage === "Kassa" || activePage === "Savdo") ? (
            <CashRegister key={activePage} mode={activePage === "Savdo" ? "sale" : "cash"} products={products} sales={allSales} expenses={expenses} shifts={inventory.shifts ?? []} user={user} now={now} company={settings.company} customerOrders={inventory.customerOrders ?? []} onSaveOrder={saveCustomerOrder} onSave={saveSale} onExpense={addExpense} onShift={(close) => {
              const time = new Date().toISOString();
              setInventory((current) => {
                const open = (current.shifts ?? []).find((item) => item.userId === user.id && !item.closedAt);
                if (close && open) return { ...current, shifts: current.shifts.map((item) => item.id === open.id ? { ...item, closedAt: time } : item) };
                if (!close && !open) return { ...current, shifts: [{ id: crypto.randomUUID(), userId: user.id, name: user.name, openedAt: time }, ...(current.shifts ?? [])] };
                return current;
              });
            }} onCancel={(id, reason) => {
              const time = new Date().toISOString();
              const result = cancelSale(inventory, id, reason, user, time);
              if (result.error) return result.error;
              setInventory((current) => cancelSale(current, id, reason, user, time).inventory ?? current);
              return null;
            }} />
          ) : activePage === "Ishlab chiqarish" ? (
            <Production onAssign={(id, assigneeId) => {
              if (!isAdmin) return;
              const worker = workers.find((item) => item.id === assigneeId);
              if (assigneeId && !worker) return;
              setInventory((current) => ({ ...current, production: current.production.map((item) => item.id === id && item.status !== "Tayyor" ? { ...item, assigneeId: worker?.id ?? null, assigneeName: worker?.name ?? "Biriktirilmagan" } : item) }));
            }} admin={isAdmin} workers={workers} products={isAdmin ? products : []} orders={isAdmin ? production : production.filter((item) => item.assigneeId === user.id)} onAdd={addProduction} onComplete={finishProduction} onDelete={(id) => isAdmin && setInventory((current) => ({ ...current, production: current.production.filter((item) => item.id !== id || item.status === "Tayyor") }))} />
          ) : activePage === "Moliya" ? (
            <Finance sales={sales} expenses={expenses} onAdd={addExpense} onDelete={(id) => setInventory((current) => ({ ...current, expenses: current.expenses.filter((item) => item.id !== id), operations: [{ id: crypto.randomUUID(), time: new Date().toISOString(), name: "Xarajat", action: "Xarajat o‘chirildi" }, ...current.operations] }))} />
          ) : activePage === "Xodimlar" ? (
            <Employees now={now} schedule={attendanceSchedule} editorRef={employeeEditor} marks={attendanceMarks} onMark={markAttendance} attendance={attendance.filter((item) => !item.cancelledAt)} bonuses={bonuses} onBonus={saveBonus} attendanceError={attendanceError || bonusError} employees={employees} onSave={saveEmployee} onDelete={(id) => setInventory((current) => ({ ...current, employees: current.employees.filter((item) => item.id !== id) }))} />
          ) : activePage === "Hisobotlar" ? (
            isAdmin ? <Reports onExcel={() => downloadExcel("barcha-malumotlar.xlsx", inventorySheets({ ...inventory, attendance, bonuses, attendanceMarks, attendanceSchedule }))} sales={sales} expenses={expenses} operations={operations} now={now} /> : null
          ) : activePage === "Sozlamalar" ? (
            <><SettingsPage settings={settings} onSave={(value) => setInventory((current) => ({ ...current, settings: value }))} theme={theme} setTheme={setTheme} storageError={storageError} onBackup={downloadBackup} onExcel={() => downloadExcel("barcha-malumotlar.xlsx", inventorySheets({ ...inventory, attendance, bonuses, attendanceMarks, attendanceSchedule }))} /><UserAccess employees={employees} /></>
          ) : activePage === "Ombor" ? (isAdmin ? null : <CatalogView products={products} title="Ombor" />) : (
            <section className="panel placeholder-panel">
              <div className="placeholder-icon">
                {(() => {
                  const selected = menuItems.find(
                    (item) => item.name === activePage
                  );
                  const Icon = selected?.icon ?? Settings;
                  return <Icon size={32} />;
                })()}
              </div>
              <h2>{activePage} bo‘limi</h2>
              <p>
                Bu bo‘limni keyingi bosqichda funksiyalar bilan to‘ldiramiz.
              </p>
              <button
                className="back-button"
                onClick={() => setActivePage("Asosiy oyna")}
              >
                Asosiy oynaga qaytish
              </button>
            </section>
          )}
          {isAdmin && <div hidden={activePage !== "Ombor"}>
            <Warehouse products={products} onSaveProduct={saveProduct} onDeleteProduct={deleteProduct} search={warehouseSearch} setSearch={setWarehouseSearch} category={warehouseCategory} setCategory={setWarehouseCategory} />
          </div>}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useTheme();
  return <AuthGate>{(user, onLogout) => <Workspace key={user.id} user={user} onLogout={onLogout} theme={theme} setTheme={setTheme} />}</AuthGate>;
}
