import { useMemo, useRef, useState } from "react";
import { Download, Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { nextProductCode } from "../../catalog.js";
import "./Warehouse.css";
import "./Products.css";

const categories = ["Granit", "Marmar", "Tayyor mahsulot", "Xomashyo", "Qo‘shimcha"];
const units = ["dona", "metr", "m²", "m³", "kg", "tonna"];
const money = (value) => `${Number(value ?? 0).toLocaleString("uz-UZ")} so‘m`;
const amount = (value) => Number(value ?? 0).toLocaleString("uz-UZ");

export default function Products({ products, onSaveProduct, onDeleteProduct }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Barchasi");
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [qrProduct, setQrProduct] = useState(null);
  const editorDialog = useRef(null);
  const qrDialog = useRef(null);
  const qrImage = useRef(null);
  const orderDialog = useRef(null);
  const [orderForm, setOrderForm] = useState({ type: '', name: '', description: '', minimumHeight: '', price: '', salePrice: '' });
  const [orderError, setOrderError] = useState('');

  function saveOrderProduct(event) {
    event.preventDefault();
    const sokl = orderForm.type === 'sokl';
    const saveError = onSaveProduct({
      id: crypto.randomUUID(), code: nextProductCode(products),
      name: sokl ? `Sokl ${orderForm.minimumHeight} sm` : orderForm.name.trim(),
      category: 'Tayyor mahsulot', unit: sokl ? 'metr' : 'm²', quantity: 0, minimumStock: 0, stockReference: 0,
      price: sokl ? Number(orderForm.price) : 0, salePrice: sokl ? Number(orderForm.salePrice) : 0,
      description: orderForm.description.trim(), orderOnly: true, orderProductType: orderForm.type,
      ...(sokl ? { minimumHeightCm: Number(orderForm.minimumHeight) } : {}),
    }, false);
    if (saveError) { setOrderError(saveError); return; }
    orderDialog.current.close();
    setMessage('Buyurtma uchun mahsulot saqlandi.');
  }

  const categoryOptions = [...new Set([...categories, ...products.map((product) => product.category)])];
  const unitOptions = [...new Set([...units, ...products.map((product) => product.unit)])];
  const lowStockCount = products.filter((product) => product.quantity < product.minimumStock).length;
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz-UZ");
    return products.filter((product) => {
      const searchable = `${product.name} ${product.code ?? ""} ${product.category}`.toLocaleLowerCase("uz-UZ");
      return searchable.includes(query) && (category === "Barchasi" || category === product.category);
    });
  }, [products, search, category]);

  function openEditor(product = null) {
    setEditingProduct(product);
    setError("");
    setForm(product ? {
      id: product.id,
      name: product.name,
      code: product.code ?? "",
      category: product.category,
      unit: product.unit,
      quantity: String(product.quantity),
      weightKg: String(product.weightKg ?? ""),
      minimumStock: String(product.minimumStock ?? 0),
      price: String(product.price),
      salePrice: String(product.salePrice ?? product.price),
    } : {
      id: crypto.randomUUID(),
      name: "",
      code: nextProductCode(products),
      category: "Granit",
      unit: "m²",
      quantity: "0",
      weightKg: "",
      minimumStock: "0",
      price: "",
      salePrice: "",
    });
    editorDialog.current.showModal();
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function submit(event) {
    event.preventDefault();
    const quantity = Number(form.quantity);
    const product = {
      ...editingProduct,
      ...form,
      name: form.name.trim(),
      code: form.code.trim(),
      quantity,
      minimumStock: Number(form.minimumStock),
      price: Number(form.price),
      salePrice: Number(form.salePrice),
      stockReference: editingProduct && editingProduct.unit === form.unit
        ? (Number(editingProduct.stockReference) > 0 ? Number(editingProduct.stockReference) : quantity)
        : quantity,
    };
    const saveError = onSaveProduct(product, editingProduct !== null);
    if (saveError) {
      setError(saveError);
      return;
    }
    editorDialog.current.close();
    setMessage(editingProduct ? "Mahsulot ma’lumotlari yangilandi." : "Yangi mahsulot qo‘shildi.");
  }

  function deleteProduct(product) {
    if (!window.confirm(`“${product.name}” mahsulotini o‘chirmoqchimisiz?`)) return;
    const deleteError = onDeleteProduct(product.id);
    setMessage(typeof deleteError === "string" ? deleteError : "Mahsulot o‘chirildi.");
  }

  function openQr(product) {
    setQrProduct(product);
    qrDialog.current.showModal();
  }

  function downloadQr() {
    const svg = qrImage.current?.querySelector("svg");
    if (!svg || !qrProduct) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${qrProduct.code.replace(/[^a-zA-Z0-9_-]/g, "_")}-qr.svg`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="warehouse-page products-page">
    <div className="warehouse-heading">
      <div><h2>Mahsulotlar katalogi</h2><p>Mahsulot kodi, ombor minimumi va narxlarini boshqaring</p></div>
      <div className="products-heading-actions">
        <button className="warehouse-add-btn" type="button" onClick={() => openEditor()}><Plus size={19} />Yangi mahsulot</button>
        <button className="erp-secondary products-order-products-button" type="button" onClick={() => { setOrderForm({ type: '', name: '', description: '', minimumHeight: '', price: '', salePrice: '' }); setOrderError(''); orderDialog.current.showModal(); }}><Package size={18} aria-hidden="true" />Buyurtma uchun mahsulotlar</button>
      </div>
    </div>

    <div className="warehouse-summary">
      <article className="warehouse-summary-card"><span>Mahsulot turlari</span><strong>{products.length} ta</strong></article>
      <article className="warehouse-summary-card"><span>Minimumdan kam qolgan</span><strong className={lowStockCount ? "products-low-summary" : undefined}>{lowStockCount} ta</strong></article>
      <article className="warehouse-summary-card"><span>Ombordagi tannarx qiymati</span><strong>{money(products.reduce((total, product) => total + product.quantity * product.price, 0))}</strong></article>
    </div>

    {message && <p className="products-message" role="status">{message}</p>}

    <section className="warehouse-table-panel" aria-label="Mahsulotlar ro‘yxati">
      <div className="warehouse-toolbar">
        <label className="warehouse-search"><Search size={19} /><input type="search" aria-label="Mahsulot nomi yoki ID raqami bo‘yicha qidirish" placeholder="Nomi, ID yoki kategoriya..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <select aria-label="Mahsulot kategoriyasi" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>Barchasi</option>{categoryOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="warehouse-table-wrapper" tabIndex={0} role="region" aria-label="Mahsulotlar jadvali, yon tomonga aylantirish mumkin">
        <table className="warehouse-table products-table">
          <thead><tr><th scope="col">ID raqami</th><th scope="col">Mahsulot</th><th scope="col">Omborda</th><th scope="col">Minimal qoldiq</th><th scope="col">Tannarx</th><th scope="col">Sotuv narxi</th><th scope="col">QR kod</th><th scope="col">Amallar</th></tr></thead>
          <tbody>
            {filteredProducts.map((product) => <tr key={product.id}>
              <td><span className="products-code">{product.code}</span></td>
              <td><div className="warehouse-product-name"><span className="warehouse-product-icon"><Package size={19} /></span><div className="products-name"><strong>{product.name}</strong><small>{product.category}</small></div></div></td>
              <td><div className="products-quantity"><strong>{amount(product.quantity)} {product.unit}</strong>{product.quantity < product.minimumStock && <span className="products-low-badge">Minimumdan kam</span>}</div></td>
              <td>{amount(product.minimumStock)} {product.unit}</td>
              <td>{money(product.price)}</td><td><strong className="products-sale-price">{money(product.salePrice)}</strong></td>
              <td><button type="button" className="products-qr-button" title="QR kodni kattalashtirish" aria-label={`${product.name} QR kodini ochish`} onClick={() => openQr(product)}><QRCodeSVG value={product.code} size={64} level="M" marginSize={4} bgColor="#ffffff" fgColor="#000000" /></button></td>
              <td><div className="warehouse-actions"><button type="button" className="warehouse-edit-btn" title="Tahrirlash" aria-label={`${product.name} mahsulotini tahrirlash`} onClick={() => openEditor(product)}><Pencil size={17} /></button>{onDeleteProduct && <button type="button" className="warehouse-delete-btn" title="O‘chirish" aria-label={`${product.name} mahsulotini o‘chirish`} onClick={() => deleteProduct(product)}><Trash2 size={17} /></button>}</div></td>
            </tr>)}
            {filteredProducts.length === 0 && <tr><td colSpan={8} className="warehouse-empty">{products.length ? "Mahsulot topilmadi." : "Hali mahsulotlar yo‘q. Yangi mahsulot qo‘shing."}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="warehouse-table-footer">Ko‘rsatilmoqda: {filteredProducts.length} ta mahsulot · Narxlar bitta o‘lchov birligi uchun.</div>
    </section>

    <dialog ref={orderDialog} className="warehouse-modal products-dialog" aria-labelledby="order-product-title">
      <div className="warehouse-modal-heading"><div><h3 id="order-product-title">Buyurtma uchun mahsulotlar</h3><p>Mahsulot turini tanlang va ma’lumotlarini kiriting.</p></div><button type="button" className="warehouse-close-btn" aria-label="Oynani yopish" onClick={() => orderDialog.current.close()}><X size={21} /></button></div>
      <div className="products-order-types" role="group" aria-label="Buyurtma mahsuloti turi">{[['sokl', 'Sokl'], ['pol', 'Pol']].map(([type, label]) => <button key={type} type="button" className="erp-secondary" aria-pressed={orderForm.type === type} onClick={() => { setOrderForm((current) => ({ ...current, type })); setOrderError(''); }}><Package size={20} aria-hidden="true" />{label}</button>)}</div>
      {orderForm.type && <form onSubmit={saveOrderProduct}>
        {orderForm.type === 'pol' ? <label>Mahsulot nomi<input required maxLength={150} placeholder="Pol mahsulotining nomi" value={orderForm.name} onChange={(event) => setOrderForm({ ...orderForm, name: event.target.value })} /></label> : <>
          <label>Minimal balandlik (sm)<input required type="number" min="0.01" step="any" placeholder="Masalan: 10" value={orderForm.minimumHeight} onChange={(event) => setOrderForm({ ...orderForm, minimumHeight: event.target.value })} /></label>
          <div className="warehouse-form-row"><label>Tannarx (so‘m)<input required type="number" min="0" step="0.01" value={orderForm.price} onChange={(event) => setOrderForm({ ...orderForm, price: event.target.value })} /></label><label>Sotuv narxi (so‘m)<input required type="number" min="0" step="0.01" value={orderForm.salePrice} onChange={(event) => setOrderForm({ ...orderForm, salePrice: event.target.value })} /></label></div>
        </>}
        <label>Mahsulot haqida ma’lumot<textarea rows={4} maxLength={2000} placeholder="Mahsulot tavsifi va qo‘shimcha ma’lumotlar" value={orderForm.description} onChange={(event) => setOrderForm({ ...orderForm, description: event.target.value })} /></label>
        {orderError && <p className="products-error" role="alert">{orderError}</p>}
        <button type="submit" className="warehouse-save-btn">Saqlash</button>
      </form>}
    </dialog>

    <dialog ref={editorDialog} className="warehouse-modal products-dialog" aria-labelledby="products-editor-title" aria-describedby="products-editor-description">
      <div className="warehouse-modal-heading"><div><h3 id="products-editor-title">{editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</h3><p id="products-editor-description">Mahsulot ma’lumotlari va ombordagi minimal qoldiqni kiriting</p></div><button type="button" className="warehouse-close-btn" aria-label="Mahsulot oynasini yopish" onClick={() => editorDialog.current.close()}><X size={21} /></button></div>
      <form onSubmit={submit}>
        <label htmlFor="catalog-name">Mahsulot nomi<input id="catalog-name" autoFocus required maxLength={150} value={form.name ?? ""} onChange={(event) => update("name", event.target.value)} placeholder="Masalan: Granit Black" /></label>
        <label htmlFor="catalog-code">ID raqami<input id="catalog-code" required maxLength={40} value={form.code ?? ""} onChange={(event) => update("code", event.target.value)} autoCapitalize="off" spellCheck={false} /><small className="products-field-note">QR kod shu ID raqamini saqlaydi. Kodda lotin harflari, raqamlar, nuqta, chiziq va pastki chiziqdan foydalaning.</small></label>
        <div className="warehouse-form-row">
          <label htmlFor="catalog-category">Kategoriya<select id="catalog-category" value={form.category ?? "Granit"} onChange={(event) => update("category", event.target.value)}>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label htmlFor="catalog-unit">O‘lchov birligi<select id="catalog-unit" value={form.unit ?? "m²"} onChange={(event) => update("unit", event.target.value)}>{unitOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="warehouse-form-row">
          {!['kg', 'tonna'].includes(form.unit) && <label htmlFor="catalog-weight">Bir birlik og‘irligi (kg)<input id="catalog-weight" type="number" min="0.000000001" step="any" required value={form.weightKg ?? ""} placeholder="Masalan: 12.5" onChange={(event) => update("weightKg", event.target.value)} /></label>}
          <label htmlFor="catalog-quantity">Ombordagi miqdor ({form.unit})<input id="catalog-quantity" type="number" min="0" step={form.unit === "dona" ? "1" : "any"} required value={form.quantity ?? ""} onChange={(event) => update("quantity", event.target.value)} /></label>
          <label htmlFor="catalog-minimum">Minimal qoldiq ({form.unit})<input id="catalog-minimum" type="number" min="0" step={form.unit === "dona" ? "1" : "any"} required value={form.minimumStock ?? ""} onChange={(event) => update("minimumStock", event.target.value)} /></label>
        </div>
        <div className="warehouse-form-row">
          <label htmlFor="catalog-cost">Tannarx (so‘m)<input id="catalog-cost" type="number" min="0" step="any" required value={form.price ?? ""} onChange={(event) => update("price", event.target.value)} /></label>
          <label htmlFor="catalog-sale-price">Sotuv narxi (so‘m)<input id="catalog-sale-price" type="number" min="0" step="any" required value={form.salePrice ?? ""} onChange={(event) => update("salePrice", event.target.value)} /></label>
        </div>
        {error && <p className="products-error" role="alert">{error}</p>}
        <button className="warehouse-save-btn" type="submit">{editingProduct ? "O‘zgarishlarni saqlash" : "Mahsulotni qo‘shish"}</button>
      </form>
    </dialog>

    <dialog ref={qrDialog} className="products-dialog products-qr-dialog" aria-labelledby="products-qr-title">
      <div className="warehouse-modal-heading"><div><h3 id="products-qr-title">Mahsulot QR kodi</h3><p>Kodni skanerlab mahsulot ID raqamini o‘qing</p></div><button type="button" className="warehouse-close-btn" aria-label="QR kod oynasini yopish" onClick={() => qrDialog.current.close()}><X size={21} /></button></div>
      {qrProduct && <div className="products-qr-content"><strong>{qrProduct.name}</strong><div ref={qrImage} className="products-qr-image"><QRCodeSVG value={qrProduct.code} size={240} level="M" marginSize={4} bgColor="#ffffff" fgColor="#000000" /></div><span className="products-code">{qrProduct.code}</span><button className="warehouse-add-btn" type="button" onClick={downloadQr}><Download size={18} />QR kodni yuklab olish</button></div>}
    </dialog>
  </div>;
}
