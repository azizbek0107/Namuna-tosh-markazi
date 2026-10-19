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

const initialProducts = [
  {
    id: 1,
    name: "Granit Black",
    category: "Granit",
    unit: "m²",
    quantity: 120,
    price: 250000,
  },
  {
    id: 2,
    name: "Marmar White",
    category: "Marmar",
    unit: "m²",
    quantity: 85,
    price: 320000,
  },
  {
    id: 3,
    name: "Sokl",
    category: "Tayyor mahsulot",
    unit: "metr",
    quantity: 250,
    price: 35000,
  },
  {
    id: 4,
    name: "Kafel",
    category: "Kafel",
    unit: "dona",
    quantity: 500,
    price: 45000,
  },
];

const emptyForm = {
  name: "",
  category: "Granit",
  unit: "m²",
  quantity: "",
  price: "",
};

const formatMoney = (amount) =>
  new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";

function Warehouse() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Barchasi");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const categories = [
    "Barchasi",
    "Granit",
    "Marmar",
    "Kafel",
    "Xomashyo",
    "Tayyor mahsulot",
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "Barchasi" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const totalQuantity = products.reduce(
    (sum, product) => sum + Number(product.quantity),
    0
  );

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
      price: String(product.price),
    });
    setModalOpen(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const quantity = Number(form.quantity);
    const price = Number(form.price);

    if (
      !form.name.trim() ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(price) ||
      quantity < 0 ||
      price < 0 ||
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
      price,
    };

    if (editingId !== null) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingId
            ? { ...product, ...productData }
            : product
        )
      );
    } else {
      setProducts((current) => [
        ...current,
        { id: Date.now(), ...productData },
      ]);
    }

    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function deleteProduct(id) {
    const confirmed = window.confirm(
      "Ushbu mahsulotni ro'yxatdan o'chirmoqchimisiz?"
    );

    if (confirmed) {
      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );
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
          <strong>{totalQuantity.toLocaleString("uz-UZ")}</strong>
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
              placeholder="Mahsulot nomini qidiring..."
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
                <th>Narx</th>
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
                    setForm({ ...form, unit: event.target.value })
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
                  Birlik narxi (so'm)
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