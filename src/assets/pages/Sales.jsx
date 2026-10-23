import { useEffect, useId, useRef, useState } from "react";
import { ShoppingCart, Search, Package, Trash2, X, CircleAlert, UserRound, ArrowDown, ArrowUp, Image as ImageIcon } from "lucide-react";
import "./Sales.css";
import { tashkentDay } from "../../attendance.js";
import { productCategories } from "../../catalog.js";
import PaymentMethodSelect from "./PaymentMethodSelect.jsx";
import UzbekPhoneInput from "./UzbekPhoneInput.jsx";
import { normalizeUzPhone } from "../../uzbekPhone.js";
import DeliveryDateInput from "./DeliveryDateInput.jsx";
import DeliveryTimeInput from "./DeliveryTimeInput.jsx";
import { formatUzDate, getDeliveryTimeError, getTimeRangeError } from "../../uzbekDate.js";
import { orderWeight, formatOrderWeight } from "../../orderWeight.js";

const money = (amount) => amount.toLocaleString("uz-UZ") + " so‘m";
const emptyForm = { customer: "", customerPhone: "", paymentMethod: "cash", debtDate: "", debtDueDate: "" };
const lineAmount = (item) => Math.round(Number(item.quantity) * Number(item.price) * 100) / 100;

function ProductCardContent({ product, price = product?.salePrice ?? product?.price ?? 0 }) {
  return <>
    <span className="sales-product-image" aria-hidden="true"><ImageIcon size={32} /><small>Rasm uchun joy</small>{product?.imageUrl && <img src={product.imageUrl} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</span>
    <span className="sales-product-info"><strong>{product?.name ?? "Mahsulot topilmadi"}</strong><small>{product?.code && <>ID: {product.code} · </>}{product?.category} · Qoldiq: {(product?.quantity ?? 0).toLocaleString("uz-UZ")} {product?.unit}</small><b>{money(price)}</b></span>
  </>;
}

export default function Sales({ products, onSave, onSaveOrder, disabled = false, showCategories = false, headingsInHeader = false, view = "split", cartProductCards = false, quickSearchDisabled = false, now, onViewChange, draftStorageKey }) {
  const [fallbackNow, setFallbackNow] = useState(Date.now);
  const currentTime = cartProductCards ? fallbackNow : now ?? fallbackNow;
  const animatedPanels = cartProductCards && view !== "split";
  const saleFormId = useId();
  const searchTitleId = useId();
  const deliveryErrorId = useId();
  const searchDialog = useRef(null);
  const searchInput = useRef(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [quickCategory, setQuickCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [category, setCategory] = useState(null);
  const quantityInputs = useRef(new Map());
  const productRepeatClicks = useRef(new Map());
  const savingLock = useRef(false);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [includeService, setIncludeService] = useState(false);
  const [service, setService] = useState({ serviceName: '', servicePrice: '' });
  const [order, setOrder] = useState(() => ({ firstName: '', lastName: '', phone: '', relativeFirstName: '', relativeLastName: '', relativePhone: '', orderDate: tashkentDay(Date.now()), deliveryDate: '', deliveryTime: '' }));
  const [closedCustomers, setClosedCustomers] = useState(() => {
    if (!draftStorageKey) return [];
    try {
      const stored = JSON.parse(localStorage.getItem(draftStorageKey) || '[]');
      return Array.isArray(stored) ? stored.filter((draft) => draft && typeof draft.id === 'string' && Array.isArray(draft.items) && draft.form && draft.order && draft.service) : [];
    } catch { return []; }
  });
  const [showClosedCustomers, setShowClosedCustomers] = useState(false);
  function currentDraft() {
    return { id: crypto.randomUUID(), items, form, order, service, includeService, showOrder };
  }
  function storeClosedCustomers(next) {
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(next));
      setClosedCustomers(next);
      return true;
    } catch {
      setMessage({ error: true, text: "Mijoz oynasini saqlab bo‘lmadi. Brauzer xotirasini tekshiring." });
      onViewChange?.("order");
      return false;
    }
  }
  function closeCustomer() {
    if (savingLock.current || !items.length) return;
    if (!storeClosedCustomers([...closedCustomers, currentDraft()])) return;
    setItems([]);
    setForm(emptyForm);
    setOrder({ firstName: '', lastName: '', phone: '', relativeFirstName: '', relativeLastName: '', relativePhone: '', orderDate: tashkentDay(Date.now()), deliveryDate: '', deliveryTime: '' });
    setService({ serviceName: '', servicePrice: '' });
    setIncludeService(false);
    setShowOrder(false);
    setMessage(null);
    productRepeatClicks.current.clear();
    onViewChange?.("order");
  }
  function openCustomer(draft) {
    if (savingLock.current) return;
    const next = closedCustomers.filter((entry) => entry.id !== draft.id);
    if (items.length || form.customer.trim() || form.customerPhone.trim() || Object.entries(order).some(([key, value]) => key !== 'orderDate' && value) || includeService || service.serviceName || service.servicePrice) next.push(currentDraft());
    if (!storeClosedCustomers(next)) return;
    setItems(draft.items);
    setForm({ ...emptyForm, ...draft.form });
    setOrder(draft.order);
    setService(draft.service);
    setIncludeService(Boolean(draft.includeService));
    setShowOrder(Boolean(draft.showOrder));
    setFallbackNow(Date.now());
    setMessage(null);
    setShowClosedCustomers(false);
    productRepeatClicks.current.clear();
    onViewChange?.("order");
  }
  const amount = items.reduce((total, item) => total + lineAmount(item), 0);
  const loadWeight = orderWeight(products, items);
  const debtContactsRequired = cartProductCards && form.paymentMethod === "debt" && amount > 100000;
  const debtMaximum = form.debtDate ? new Date(Date.parse(`${form.debtDate}T00:00:00Z`) + 45 * 86400000).toISOString().slice(0, 10) : "";
  const debtDateError = cartProductCards && form.paymentMethod === "debt" && (!form.debtDueDate || form.debtDueDate < form.debtDate || form.debtDueDate > debtMaximum);
  const basicOrderContacts = cartProductCards && form.paymentMethod === "cash";
  const orderPhonesComplete = !cartProductCards || (normalizeUzPhone(order.phone) !== null && (basicOrderContacts || normalizeUzPhone(order.relativePhone) !== null));
  const deliveryTimeError = cartProductCards ? getDeliveryTimeError(order.deliveryDate, order.deliveryTime, currentTime) : "";
  const deliveryRangeError = cartProductCards ? getTimeRangeError(order.deliveryTime) : "";
  const deliveryValidationError = deliveryRangeError || deliveryTimeError;
  const orderTimeComplete = !cartProductCards || /^([01]\d|2[0-3]):[0-5]\d$/.test(order.deliveryTime);
  const deliveryConfirmed = cartProductCards && Boolean(formatUzDate(order.deliveryDate)) && orderTimeComplete && !deliveryValidationError;

  useEffect(() => {
    if (!cartProductCards || !showOrder) return;
    const refresh = () => setFallbackNow(Date.now());
    const timer = setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [cartProductCards, showOrder]);

  useEffect(() => {
    if (!cartProductCards || quickSearchDisabled) return;
    function openQuickSearch(event) {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || event.isComposing || (event.key.toLowerCase() !== "k" && event.code !== "KeyK")) return;
      event.preventDefault();
      if (event.repeat) return;
      const dialog = searchDialog.current;
      if (!dialog) return;
      const activeModal = document.querySelector("dialog:modal");
      if (activeModal && activeModal !== dialog) return;
      if (!dialog.open) dialog.showModal();
      searchInput.current?.focus();
      searchInput.current?.select();
    }
    window.addEventListener("keydown", openQuickSearch);
    return () => window.removeEventListener("keydown", openQuickSearch);
  }, [cartProductCards, quickSearchDisabled]);

  const categories = [...new Set([...productCategories, ...products.map((product) => product.category).filter(Boolean)])];
  const visibleProducts = products.filter((product) => (!showCategories || category === null || product.category === category) && `${product.code ?? ""} ${product.name} ${product.category}`.toLocaleLowerCase("uz-UZ").includes(productSearch.trim().toLocaleLowerCase("uz-UZ")));
  const quickSearchProducts = products.filter((product) => (quickCategory === null || product.category === quickCategory) && `${product.code ?? ""} ${product.name} ${product.category}`.toLocaleLowerCase("uz-UZ").includes(quickSearch.trim().toLocaleLowerCase("uz-UZ")));
  function selectProduct(product, focusQuantity = true) {
    const productId = String(product.id);
    if (cartProductCards && items.some((item) => item.productId === productId)) {
      const clicks = (productRepeatClicks.current.get(productId) ?? 0) + 1;
      if (clicks >= 2) {
        setItems((current) => current.filter((item) => item.productId !== productId));
        productRepeatClicks.current.delete(productId);
      } else productRepeatClicks.current.set(productId, clicks);
      setMessage(null);
      return;
    }
    productRepeatClicks.current.set(productId, 0);
    setItems((current) => current.some((item) => item.productId === productId) ? current : [...current, { productId, quantity: String(Math.min(1, product.quantity)), price: String(product.salePrice ?? product.price) }]);
    setMessage(null);
    if (view === "catalog" || !focusQuantity) return;
    requestAnimationFrame(() => {
      const input = quantityInputs.current.get(productId);
      input?.focus({ preventScroll: true });
      input?.select();
      if (window.matchMedia("(max-width: 800px)").matches) input?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
  function update(field, value) {
    if (cartProductCards && field === "paymentMethod" && value === "debt") {
      const today = tashkentDay(Date.now());
      const due = new Date(Date.parse(`${today}T00:00:00Z`) + 45 * 86400000).toISOString().slice(0, 10);
      setForm((current) => ({ ...current, paymentMethod: value, debtDate: today, debtDueDate: current.debtDueDate || due }));
      setMessage(null);
      return;
    }
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
  }
  function updateItem(productId, field, value) {
    setItems((current) => current.map((item) => item.productId === productId ? { ...item, [field]: value } : item));
    setMessage(null);
  }
  function submit(event) {
    event.preventDefault();
    if (debtDateError) { setMessage({ error: true, text: "Qarzni qaytarish muddati savdo sanasidan 45 kundan oshmasligi kerak." }); return; }
    if (debtContactsRequired && (!form.customer.trim() || !normalizeUzPhone(form.customerPhone))) { setMessage({ error: true, text: "100 000 so‘mdan ortiq qarz uchun xaridor ismi va to‘liq telefon raqamini kiriting." }); return; }
    if (savingLock.current || disabled || !items.length) return;
    savingLock.current = true;
    setSaving(true);
    try {
      const error = onSave({ ...form, items });
      if (error) setMessage({ error: true, text: error });
      else {
        setForm(emptyForm);
        setItems([]);
        setMessage({ error: false, text: "Sotuv saqlandi. Ombor qoldig‘i va daromad yangilandi." });
      }
    } catch { setMessage({ error: true, text: "Sotuvni saqlab bo‘lmadi. Qayta urinib ko‘ring." }); }
    finally { setSaving(false); savingLock.current = false; }
  }
  const cartItems = <div className={`sales-cart-items${cartProductCards ? " sales-cart-product-list" : ""}`}>{items.map((item) => {
    const product = products.find((value) => String(value.id) === item.productId);
    const exceedsStock = Number(item.quantity) > (product?.quantity ?? 0);
    return <article className={cartProductCards ? "sales-cart-product-card" : "sales-cart-item"} key={item.productId}>
      {cartProductCards ? <div className="sales-product sales-cart-product-visual">
        <ProductCardContent product={product} price={Number(item.price)} />
        <button type="button" className="warehouse-delete-btn sales-cart-remove" title="Savatdan olib tashlash" aria-label={`${product?.name ?? "Mahsulot"}: savatdan olib tashlash`} disabled={saving} onClick={() => { setItems((current) => current.filter((value) => value.productId !== item.productId)); setMessage(null); }}><Trash2 size={16} /></button>
      </div> : <>
      <div className="sales-cart-heading"><strong>{product?.name ?? "Mahsulot topilmadi"}</strong><button type="button" className="warehouse-delete-btn" title="Savatdan olib tashlash" aria-label={`${product?.name ?? "Mahsulot"}: savatdan olib tashlash`} disabled={saving} onClick={() => { setItems((current) => current.filter((value) => value.productId !== item.productId)); setMessage(null); }}><Trash2 size={16} /></button></div>
      <small>Qoldiq: {product?.quantity ?? 0} {product?.unit}</small>
      </>}
      <label>Miqdor ({product?.unit})<input ref={(node) => { if (node) quantityInputs.current.set(item.productId, node); else quantityInputs.current.delete(item.productId); }} type="number" form={cartProductCards && showOrder ? "customer-order-form" : saleFormId} required aria-label={cartProductCards ? `${product?.name ?? "Mahsulot"}: miqdor (${product?.unit ?? ""})` : undefined} min={product?.unit === "dona" ? 1 : "0.000000001"} max={product?.quantity ?? 0} step={product?.unit === "dona" ? 1 : "any"} aria-invalid={exceedsStock || undefined} disabled={saving} value={item.quantity} onChange={(event) => updateItem(item.productId, "quantity", event.target.value)} /></label>
      {!cartProductCards && <>
      <p className="sales-cart-unit-price">Birlik narxi: <strong>{money(Number(item.price))}</strong></p>
      <strong className="sales-cart-subtotal">{money(Number.isFinite(lineAmount(item)) ? lineAmount(item) : 0)}</strong>
      </>}
    </article>;
  })}</div>;
  const checkoutFields = <>
    {cartProductCards && form.paymentMethod === "debt" && <>
      <div className="sales-delivery-row">
      <div className="sales-accepted-field"><span>Qarz berilgan sana</span><div className="sales-accepted-display sales-debt-date-display"><time dateTime={form.debtDate}>{formatUzDate(form.debtDate)}</time></div></div>
      <DeliveryDateInput key={form.debtDate} label="Qaytarish sanasi" min={form.debtDate} max={debtMaximum} value={form.debtDueDate} disabled={saving} invalid={Boolean(form.debtDueDate && debtDateError)} onChange={(value) => update("debtDueDate", value)} />
      </div>
      {debtDateError && <p className="sales-delivery-error" role="status">Qarz muddati 45 kundan oshmasligi kerak.</p>}
    </>}
    {debtContactsRequired && <UzbekPhoneInput label="Xaridorning telefon raqami" value={form.customerPhone} disabled={saving} onChange={(value) => update("customerPhone", value)} />}
    <label>{form.paymentMethod === "debt" ? "Qarzdor mijoz" : "Xaridor (ixtiyoriy)"}<span className={cartProductCards ? "sales-customer-input" : undefined}>{cartProductCards && <UserRound size={18} aria-hidden="true" />}<input required={form.paymentMethod === "debt"} value={form.customer} maxLength={150} placeholder="Chakana xaridor" onChange={(event) => update("customer", event.target.value)} /></span></label>
    {cartProductCards ? <PaymentMethodSelect value={form.paymentMethod} onChange={(value) => update("paymentMethod", value)} disabled={saving} active={view === "order"} /> : <label>To‘lov turi<select value={form.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)}><option value="cash">Naqd</option><option value="card">Karta</option><option value="debt">Qarz</option></select></label>}
    <div className="sales-checkout sales-checkout-actions"><div className="sales-checkout-total"><span>Jami to‘lov</span><strong>{money(Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) / 100 : 0)}</strong></div><button type="button" className="warehouse-add-btn sales-order-button" disabled={!items.length || saving} aria-expanded={showOrder} aria-controls="customer-order-form" onClick={() => { if (cartProductCards) setFallbackNow(Date.now()); setShowOrder(!showOrder); setMessage(null); }}>Buyurtma sifatida saqlash</button><button className={`warehouse-add-btn${debtDateError ? " sales-order-save-invalid" : ""}`} type="submit" disabled={debtDateError || !items.length || items.some((item) => !products.some((product) => String(product.id) === item.productId && product.quantity > 0)) || saving || disabled}>{saving ? "Saqlanmoqda…" : "Sotuvni saqlash"}</button></div>
  </>;
  const customerOrderForm = showOrder && <form id="customer-order-form" className="sales-form" onSubmit={(event) => {
    event.preventDefault();
    if (!orderPhonesComplete) { setMessage({ error: true, text: 'Telefon raqamlarini to‘liq kiriting.' }); return; }
    if (!orderTimeComplete) { setMessage({ error: true, text: deliveryRangeError || 'Yetkazib berish vaqtini to‘liq kiriting (soat:daqiqa).' }); return; }
    const currentDeliveryError = cartProductCards ? getDeliveryTimeError(order.deliveryDate, order.deliveryTime, Date.now()) : "";
    if (currentDeliveryError) { setMessage({ error: true, text: currentDeliveryError }); return; }
    if (savingLock.current) return;
    savingLock.current = true;
    setSaving(true);
    try {
      const error = onSaveOrder({ ...order, ...service, includeService, items, paymentMethod: form.paymentMethod });
      if (error) { setMessage({ error: true, text: error }); return; }
      setItems([]); setShowOrder(false); setForm(emptyForm); setIncludeService(false); setService({ serviceName: '', servicePrice: '' });
      setOrder({ firstName: '', lastName: '', phone: '', relativeFirstName: '', relativeLastName: '', relativePhone: '', orderDate: tashkentDay(Date.now()), deliveryDate: '', deliveryTime: '' });
      setMessage({ error: false, text: 'Buyurtma saqlandi. Uni Kassa bo‘limida ko‘rishingiz mumkin.' });
    } catch { setMessage({ error: true, text: 'Buyurtmani saqlab bo‘lmadi. Qayta urinib ko‘ring.' }); }
    finally { savingLock.current = false; setSaving(false); }
  }}>
    <h3>Buyurtma ma’lumotlari</h3>
    {[
      ['firstName', 'Mijozning ismi'], ['lastName', 'Mijozning familiyasi'], ['phone', 'Mijozning telefon raqami'],
      ['relativeFirstName', 'Yaqin qarindoshining ismi'], ['relativeLastName', 'Yaqin qarindoshining familiyasi'], ['relativePhone', 'Yaqin qarindoshining telefon raqami'],
    ].filter(([key]) => !basicOrderContacts || key === 'firstName' || key === 'phone').map(([key, label]) => cartProductCards && key.toLowerCase().includes('phone') ? <UzbekPhoneInput key={key} label={label} value={order[key]} disabled={saving} onChange={(value) => setOrder((current) => ({ ...current, [key]: value }))} /> : <label key={key}>{label}<input required type={key.toLowerCase().includes('phone') ? 'tel' : 'text'} maxLength={key.toLowerCase().includes('phone') ? 25 : 100} value={order[key]} onChange={(event) => setOrder((current) => ({ ...current, [key]: event.target.value }))} /></label>)}
    {cartProductCards ? <div className="sales-accepted-field">
      <span>Qabul qilingan sana va vaqt (Toshkent)</span>
      <div className="sales-accepted-display" role="group" aria-label="Qabul qilingan sana va vaqt, Toshkent">
        <time dateTime={tashkentDay(currentTime)}>{new Date(currentTime).toLocaleDateString("uz-UZ", { timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit", day: "2-digit" })}</time>
        <span>{new Date(currentTime).toLocaleTimeString("uz-UZ", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hour12: false })}</span>
      </div>
    </div> : <label>Buyurtma kuni<input required type="date" value={order.orderDate} onChange={(event) => setOrder((current) => ({ ...current, orderDate: event.target.value }))} /></label>}
    {cartProductCards && <div className="sales-delivery-row">
      <DeliveryDateInput value={order.deliveryDate} min={tashkentDay(currentTime)} disabled={saving} invalid={Boolean(deliveryTimeError)} describedBy={deliveryErrorId} onChange={(value) => setOrder((current) => ({ ...current, deliveryDate: value }))} />
      <DeliveryTimeInput value={order.deliveryTime} disabled={saving} confirmed={deliveryConfirmed} active={view !== "catalog"} error={deliveryValidationError} describedBy={deliveryErrorId} onChange={(value) => setOrder((current) => ({ ...current, deliveryTime: value }))} />
    </div>}
    {deliveryValidationError && <p id={deliveryErrorId} className="sales-delivery-error" role="status"><CircleAlert size={15} aria-hidden="true" /><span>{deliveryValidationError}</span></p>}
    <div className="sales-service-choice" role="group" aria-label="Buyurtmaga xizmat qo‘shish"><span>Xizmat</span><div className="erp-actions"><button type="button" className="erp-secondary" aria-pressed={includeService} onClick={() => setIncludeService(true)}>Xizmat bor</button><button type="button" className="erp-secondary" aria-pressed={!includeService} onClick={() => setIncludeService(false)}>Xizmat yo‘q</button></div></div>
    {includeService && <>
      <label>Xizmat nomi<input required maxLength={150} value={service.serviceName} onChange={(event) => setService((current) => ({ ...current, serviceName: event.target.value }))} /></label>
      <label>Xizmat narxi (so‘m)<input required type="number" min="0" max="1000000000000" step="0.01" value={service.servicePrice} onChange={(event) => setService((current) => ({ ...current, servicePrice: event.target.value }))} /></label>
    </>}
    <div className="sales-order-totals">{cartProductCards && <p className="sales-cart-unit-price" title="Jami yuk og‘irligi">Y. O: <strong>{loadWeight.complete ? formatOrderWeight(loadWeight.kilograms) : "Og‘irlik kiritilmagan"}</strong></p>}<p className="sales-cart-unit-price">Buyurtma jami: <strong>{money(amount + (includeService && Number.isFinite(Number(service.servicePrice)) ? Number(service.servicePrice) : 0))}</strong></p></div>
    <div className="erp-actions"><button className={`warehouse-add-btn${cartProductCards && !deliveryConfirmed ? " sales-order-save-invalid" : ""}`} disabled={saving || !items.length || !orderPhonesComplete || !orderTimeComplete || Boolean(deliveryValidationError) || (cartProductCards && !deliveryConfirmed)}>Buyurtmani saqlash</button><button type="button" className="erp-secondary" onClick={() => setShowOrder(false)}>Bekor qilish</button></div>
  </form>;
  return <div className="sales-page">
    {draftStorageKey && view === "order" && <div className="sales-customer-windows">
      <div className="erp-actions">
        <button type="button" className="erp-secondary" disabled={!items.length || saving || quickSearchDisabled} onClick={closeCustomer}><ArrowDown size={18} aria-hidden="true" />Saqlash</button>
        <button type="button" className="erp-secondary" disabled={saving || quickSearchDisabled} aria-expanded={showClosedCustomers} aria-controls={`${saleFormId}-closed-customers`} onClick={() => setShowClosedCustomers((open) => !open)}>{showClosedCustomers ? <ArrowDown size={18} aria-hidden="true" /> : <ArrowUp size={18} aria-hidden="true" />}{showClosedCustomers ? "Yopish" : "Ochish"} ({closedCustomers.length})</button>
      </div>
      <div className={`sales-closed-customers-collapse${showClosedCustomers ? " is-open" : ""}`} inert={!showClosedCustomers} aria-hidden={!showClosedCustomers}>
      <div className="sales-closed-customers-clip"><div id={`${saleFormId}-closed-customers`} className="sales-closed-customers" role="region" aria-label="Yopilgan mijoz oynalari">
        {!closedCustomers.length && <p>Yopilgan mijoz oynalari yo‘q.</p>}
        {closedCustomers.map((draft, index) => <button type="button" className="erp-secondary" key={draft.id} disabled={saving || quickSearchDisabled} onClick={() => openCustomer(draft)}>
          <strong>{draft.form.customer.trim() || [draft.order.firstName, draft.order.lastName].filter(Boolean).join(' ') || `Mijoz ${index + 1}`}</strong>
          <span>{draft.items.length} xil mahsulot · {money(draft.items.reduce((total, item) => total + (Number.isFinite(lineAmount(item)) ? lineAmount(item) : 0), 0))}</span>
          <small>{draft.items.map((item) => products.find((product) => String(product.id) === item.productId)?.name ?? 'Mahsulot topilmadi').join(', ')}</small>
        </button>)}
      </div></div></div>
    </div>}
    <div className={`sales-workspace${view !== "split" ? " sales-workspace-single" : ""}${animatedPanels ? " sales-workspace-stacked" : ""}`} data-view={view}>
    <section id="sales-products-panel" className="panel sales-catalog" hidden={!animatedPanels && view === "order"} inert={animatedPanels && view === "order"} aria-hidden={animatedPanels ? view === "order" : undefined} aria-labelledby={headingsInHeader ? "cashier-products-title" : "sales-products-title"}>
      {!headingsInHeader && <div className="panel-heading"><div><h3 id="sales-products-title">Mahsulotlar</h3></div><Package size={22} /></div>}
      <label className="warehouse-search sales-product-search"><Search size={18} /><input type="search" aria-label="Sotuv uchun mahsulot qidirish" placeholder="Mahsulot, ID yoki kategoriya..." value={cartProductCards ? quickSearch : productSearch} onChange={(event) => cartProductCards ? setQuickSearch(event.target.value) : setProductSearch(event.target.value)} onClick={() => {
        if (!cartProductCards || quickSearchDisabled) return;
        if (!searchDialog.current?.open) searchDialog.current?.showModal();
        searchInput.current?.focus();
      }} onKeyDown={(event) => {
        if (!cartProductCards || quickSearchDisabled || !["Enter", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        if (!searchDialog.current?.open) searchDialog.current?.showModal();
        searchInput.current?.focus();
      }} /></label>
      {showCategories && <div className={cartProductCards ? "sales-category-toolbar" : undefined}><div className="catalog-category-buttons sales-category-buttons" role="group" aria-label="Sotuv mahsulotlari kategoriyalari">
        <button type="button" className="erp-secondary" aria-pressed={category === null} onClick={() => setCategory(null)}>Barchasi</button>
        {categories.map((name) => <button key={name} type="button" className="erp-secondary" aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}
      </div>{cartProductCards && <button type="button" className="erp-secondary sales-booking-button" onClick={() => { setFallbackNow(Date.now()); setShowOrder(true); onViewChange?.("order"); }}>Buyurtma</button>}</div>}
      <div className="sales-product-list" tabIndex={cartProductCards ? 0 : undefined} role={cartProductCards ? "region" : undefined} aria-label={cartProductCards ? "Sotuv uchun mahsulotlar ro‘yxati" : undefined}>
        {visibleProducts.map((product) => <button type="button" className="sales-product" key={product.id} disabled={product.quantity <= 0 || saving} aria-pressed={items.some((item) => item.productId === String(product.id))} onClick={() => selectProduct(product)}>
          <ProductCardContent product={product} />
        </button>)}
        {visibleProducts.length === 0 && <p className="dashboard-source">{products.length ? "Mahsulot topilmadi." : "Mahsulotlar bo‘limida mahsulot qo‘shing."}</p>}
      </div>
    </section>
    <section id="sales-order-panel" className={`panel sales-order${cartProductCards ? " sales-order-fixed" : ""}`} hidden={!animatedPanels && view === "catalog"} inert={animatedPanels && view === "catalog"} aria-hidden={animatedPanels ? view === "catalog" : undefined} aria-labelledby={headingsInHeader ? "cashier-new-sale-title" : undefined}>
      {!headingsInHeader && <div className="panel-heading"><div><h3>Yangi sotuv</h3></div><ShoppingCart size={22} /></div>}
      <div className={cartProductCards ? "sales-order-heading" : undefined}>
        {cartProductCards && <div className="sales-order-search">
          <label className="warehouse-search sales-order-search-trigger"><Search size={18} aria-hidden="true" /><input type="search" aria-label="Yangi sotuv uchun mahsulot qidirish" placeholder="Mahsulot, ID yoki kategoriya..." value={quickSearch} disabled={quickSearchDisabled} onChange={(event) => setQuickSearch(event.target.value)} onClick={() => {
            if (!searchDialog.current?.open) searchDialog.current?.showModal();
            searchInput.current?.focus();
          }} onKeyDown={(event) => {
            if (!["Enter", "ArrowDown"].includes(event.key)) return;
            event.preventDefault();
            if (!searchDialog.current?.open) searchDialog.current?.showModal();
            searchInput.current?.focus();
          }} /></label>
        </div>}
        <div className="sales-selection" aria-live="polite"><strong>{items.length ? `Savatda ${items.length} xil mahsulot` : "Savat bo‘sh"}</strong></div>
      </div>
      {disabled && <p className="sales-message sales-error" role="status">Sotuvni saqlash uchun yuqoridagi “Smenani ochish” tugmasini bosing.</p>}
      {cartProductCards ? <div className="sales-order-layout">
        <div className="sales-cart-fields" tabIndex={0} role="region" aria-label="Savatdagi mahsulotlar ro‘yxati">{cartItems}</div>
        <div className="sales-order-details" tabIndex={0} role="region" aria-label="Sotuv va buyurtmani saqlash">
          {showOrder ? customerOrderForm : <form id={saleFormId} className="sales-form" onSubmit={submit}>{checkoutFields}</form>}
        </div>
      </div> : <>
        <form id={saleFormId} className="sales-form" onSubmit={submit}>{cartItems}{checkoutFields}</form>
        {customerOrderForm}
      </>}
      {products.length === 0 && <p className="dashboard-source">Mahsulotlar bo‘limida mahsulot qo‘shing.</p>}
      {message && <p className={`sales-message ${message.error ? "sales-error" : ""}`} role={message.error ? "alert" : "status"}>{message.text}</p>}
    </section>
    </div>
    {cartProductCards && <dialog ref={searchDialog} className="sales-quick-search" aria-labelledby={searchTitleId} onKeyDownCapture={(event) => {
      if (event.altKey || event.isComposing) return;
      const next = event.ctrlKey && event.key === "End";
      const previous = event.key === "Home";
      if (!next && !previous) return;
      event.preventDefault();
      event.stopPropagation();
      const options = [null, ...categories];
      const index = Math.max(0, options.indexOf(quickCategory));
      setQuickCategory(options[(index + (next ? 1 : -1) + options.length) % options.length]);
    }}>
      <div className="sales-quick-search-heading"><h2 id={searchTitleId}>Mahsulot qidirish</h2><button type="button" className="erp-secondary" aria-label="Qidiruvni yopish" onClick={() => searchDialog.current?.close()}><X size={18} /></button></div>
      <label className="warehouse-search sales-quick-search-input"><Search size={18} aria-hidden="true" /><input ref={searchInput} type="search" aria-label="Mahsulot nomi, ID yoki kategoriya" placeholder="Mahsulot nomi, ID yoki kategoriya..." value={quickSearch} onChange={(event) => setQuickSearch(event.target.value)} /></label>
      <div className="catalog-category-buttons sales-category-buttons sales-quick-search-categories" role="group" aria-label="Qidiruv kategoriyalari">
        <button type="button" className="erp-secondary" aria-pressed={quickCategory === null} onClick={() => setQuickCategory(null)}>Barchasi</button>
        {categories.map((name) => <button key={name} type="button" className="erp-secondary" aria-pressed={quickCategory === name} onClick={() => setQuickCategory(name)}>{name}</button>)}
      </div>
      <div className="sales-quick-search-results">
        {quickSearchProducts.map((product) => <button key={product.id} type="button" className="sales-quick-search-result" aria-pressed={items.some((item) => item.productId === String(product.id))} disabled={product.quantity <= 0 || saving} onClick={() => selectProduct(product, false)}>
          <span><strong>{product.name}</strong><small>{product.code && <>ID: {product.code} · </>}{product.category} · Qoldiq: {product.quantity.toLocaleString("uz-UZ")} {product.unit}</small></span>
          <span><b>{money(product.salePrice ?? product.price)}</b>{items.some((item) => item.productId === String(product.id)) && <small>Savatda</small>}</span>
        </button>)}
        {quickSearchProducts.length === 0 && <p role="status">{products.length ? "Mahsulot topilmadi." : "Hozircha mahsulotlar yo‘q."}</p>}
      </div>
      <small className="sales-quick-search-hint">Mahsulotni bosib savatga qo‘shing. Yopish: Esc</small>
    </dialog>}
  </div>;
}
