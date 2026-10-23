import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import "./Warehouse.css";

const emptyForm = {
  name: "",
  category: "Granit",
  unit: "m²",
  quantity: "",
  stockReference: "",
  price: "",
  weightKg: "",
};

const formatMoney = (amount) =>
  new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";

function Warehouse({ products, onSaveProduct, onDeleteProduct, search, setSearch, category, setCategory }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const categories = [
    "Barchasi",
    "Granit",
    "Marmar",
    "Xomashyo",
    "Tayyor mahsulot",
    "Qo‘shimcha",
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .concat(" ", product.code || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        category === "Barchasi" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const quantitiesByUnit = products.reduce((totals, product) => {
    totals[product.unit] = (totals[product.unit] ?? 0) + product.quantity;
    return totals;
  }, {});

  const totalValue = products.reduce(
    (sum, product) =>
      sum + Number(product.quantity) * Number(product.price),
    0
  );

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      quantity: String(product.quantity),
      stockReference: String(product.stockReference ?? product.quantity),
      price: String(product.price),
      weightKg: String(product.weightKg ?? ""),
    });
    setModalOpen(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const quantity = Number(form.quantity);
    const price = Number(form.price);
    const stockReference = form.stockReference === "" ? quantity : Number(form.stockReference);

    if (
      !form.name.trim() ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(price) ||
      !Number.isFinite(stockReference) ||
      !Number.isFinite(quantity * price) ||
      quantity < 0 ||
      price < 0 ||
      stockReference < 0 ||
      (quantity > 0 && stockReference === 0) ||
      form.quantity === "" ||
      form.price === ""
    ) {
      alert("Ma'lumotlarni to'g'ri kiriting.");
      return;
    }

    const productData = {
      ...form,
      name: form.name.trim(),
      quantity,
      stockReference,
      price,
    };

    const error = onSaveProduct({ id: editingId ?? crypto.randomUUID(), ...productData }, editingId !== null);
    if (error) { alert(error); return; }

    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function deleteProduct(id) {
    const confirmed = window.confirm(
      "Ushbu mahsulotni ro'yxatdan o'chirmoqchimisiz?"
    );

    if (confirmed) {
      onDeleteProduct(id);
    }
  }

  return (
    <div className="warehouse-page">
      <div className="warehouse-heading">
        <div>
          <h2>Ombor boshqaruvi</h2>
          <p>Xomashyo va tayyor mahsulotlar hisobi</p>
        </div>

        <button className="warehouse-add-btn" onClick={openAddModal}>
          <Plus size={19} />
          Mahsulot qo'shish
        </button>
      </div>

      <div className="warehouse-summary">
        <div className="warehouse-summary-card">
          <span>Mahsulot turlari</span>
          <strong>{products.length} ta</strong>
        </div>

        <div className="warehouse-summary-card">
          <span>Umumiy miqdor</span>
          <strong>
            {Object.entries(quantitiesByUnit)
              .map(([unit, quantity]) => `${quantity.toLocaleString("uz-UZ")} ${unit}`)
              .join(" / ") || "0"}
          </strong>
        </div>

        <div className="warehouse-summary-card">
          <span>Hisoblangan qiymat</span>
          <strong>{formatMoney(totalValue)}</strong>
        </div>
      </div>

      <section className="warehouse-table-panel">
        <div className="warehouse-toolbar">
          <div className="warehouse-search">
            <Search size={19} />
            <input
              type="text"
              aria-label="Mahsulot nomini qidirish"
              placeholder="Mahsulot nomi yoki ID raqami..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Kategoriya bo'yicha filtrlash"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="warehouse-table-wrapper">
          <table className="warehouse-table">
            <thead>
              <tr>
                <th>Mahsulot</th>
                <th>Kategoriya</th>
                <th>O'lchov</th>
                <th>Miqdor</th>
                <th>Tannarx</th>
                <th>Umumiy qiymat</th>
                <th>Amallar</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="warehouse-product-name">
                      <div className="warehouse-product-icon">
                        <Package size={19} />
                      </div>
                      <strong>{product.name}</strong>
                    </div>
                  </td>

                  <td>
                    <span className="warehouse-category">
                      {product.category}
                    </span>
                  </td>

                  <td>{product.unit}</td>
                  <td>{product.quantity.toLocaleString("uz-UZ")}</td>
                  <td>{formatMoney(product.price)}</td>
                  <td>
                    <strong>
                      {formatMoney(product.quantity * product.price)}
                    </strong>
                  </td>

                  <td>
                    <div className="warehouse-actions">
                      <button
                        className="warehouse-edit-btn"
                        onClick={() => openEditModal(product)}
                        aria-label={`${product.name} mahsulotini tahrirlash`}
                        title="Tahrirlash"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        className="warehouse-delete-btn"
                        onClick={() => deleteProduct(product.id)}
                        aria-label={`${product.name} mahsulotini o'chirish`}
                        title="O'chirish"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="warehouse-empty">
                    Mahsulot topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="warehouse-table-footer">
          Ko'rsatilmoqda: {filteredProducts.length} ta mahsulot
        </div>
      </section>

      {modalOpen && (
        <div
          className="warehouse-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="warehouse-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="warehouse-modal-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") setModalOpen(false);
            }}
          >
            <div className="warehouse-modal-heading">
              <div>
                <h3 id="warehouse-modal-title">
                  {editingId !== null
                    ? "Mahsulotni tahrirlash"
                    : "Yangi mahsulot"}
                </h3>
                <p>Mahsulot ma'lumotlarini kiriting</p>
              </div>

              <button
                className="warehouse-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Yopish"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Mahsulot nomi
                <input
                  type="text"
                  autoFocus
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Masalan: Granit Black"
                  required
                />
              </label>

              <label>
                Kategoriya
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  {categories
                    .filter((item) => item !== "Barchasi")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                O'lchov birligi
                <select
                  value={form.unit}
                  onChange={(event) =>
                    setForm({ ...form, unit: event.target.value, stockReference: "" })
                  }
                >
                  <option value="dona">Dona</option>
                  <option value="metr">Metr</option>
                  <option value="m²">Kvadrat metr (m²)</option>
                  <option value="m³">Kub metr (m³)</option>
                  <option value="kg">Kilogramm (kg)</option>
                  <option value="tonna">Tonna</option>
                </select>
              </label>

              {!['kg', 'tonna'].includes(form.unit) && <label>Bir birlik og‘irligi (kg)<input type="number" min="0.000000001" step="any" required value={form.weightKg} placeholder="Masalan: 12.5" onChange={(event) => setForm({ ...form, weightKg: event.target.value })} /></label>}
              <div className="warehouse-form-row">
                <label>
                  Miqdor
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm({ ...form, quantity: event.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Tannarx (so'm)
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    required
                  />
                </label>
              </div>

              <label>
                To‘liq zaxira miqdori (100%)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.stockReference}
                  onChange={(event) => setForm({ ...form, stockReference: event.target.value })}
                  placeholder="Kiritilmasa, joriy miqdor olinadi"
                />
              </label>

              <button className="warehouse-save-btn" type="submit">
                {editingId !== null ? "O'zgarishlarni saqlash" : "Mahsulotni qo'shish"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Warehouse;
