import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { formatPrice } from '../../../utils/priceUtils';
import './ProductTable.css';

export default function ProductTable({
  products = [],
  categories = [],
  searchQuery = '',
  onSearchChange,
  selectedCategory = 'all',
  onCategoryChange,
  selectedVisibility = 'all',
  onVisibilityChange,
  onEdit,
  onDelete,
  onToggleVisibility,
  onAdd
}) {
  return (
    <div className="product-table-wrapper">
      <div className="product-table-toolbar">
        <div className="product-table-filters">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, color: 'var(--text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Mahsulot nomi yoki kodi bo‘yicha qidirish..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="table-search-input"
              style={{ paddingLeft: 34 }}
              aria-label="Mahsulotlarni qidirish"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="table-select"
            aria-label="Kategoriya bo‘yicha filtrlash"
          >
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug || c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedVisibility}
            onChange={(e) => onVisibilityChange(e.target.value)}
            className="table-select"
            aria-label="Holat bo‘yicha filtrlash"
          >
            <option value="all">Barcha holatlar</option>
            <option value="visible">Faol (Ko‘rinadi)</option>
            <option value="hidden">Yashirin</option>
          </select>
        </div>

        {onAdd && (
          <button
            type="button"
            className="admin-btn-primary"
            onClick={onAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))',
              color: '#0d0d0d',
              border: 'none',
              borderRadius: 2
            }}
          >
            <Plus size={16} />
            <span>Yangi mahsulot</span>
          </button>
        )}
      </div>

      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th style={{ width: 64 }}>Rasm</th>
              <th>Mahsulot</th>
              <th>Kategoriya</th>
              <th>Narx / Tannarx</th>
              <th>O‘lchamlari</th>
              <th>Qadoq</th>
              <th>Sklad</th>
              <th>Holat</th>
              <th style={{ textAlign: 'right', width: 140 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  Mahsulotlar topilmadi
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const primaryImage = product.images?.[0]?.url || product.images?.[0]?.src || product.image;
                const isVisible = product.isVisible ?? product.is_active ?? true;
                const sizesCount = product.availableSizes?.length || product.sizes?.length || 0;
                const length = product.tile_length ?? product.sizes?.[0]?.lengthCm;
                const width = product.tile_width ?? product.sizes?.[0]?.widthCm;
                const thickness = product.thickness ?? product.sizes?.[0]?.thicknessMm;
                const pieces = product.box_pieces ?? product.sizes?.[0]?.piecesPerBox;
                const boxM2 = product.box_m2 ?? (length && width && pieces ? Math.round(((length * width * pieces) / 10000) * 1000) / 1000 : null);
                const unit = product.unit || product.priceUnit || 'm2';
                const costPrice = product.cost_price ?? product.costPrice;
                const stock = product.stock ?? product.stock_quantity;

                return (
                  <tr key={product.id || product.slug}>
                    <td>
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="product-table-thumb"
                          loading="lazy"
                        />
                      ) : (
                        <div className="product-table-thumb-placeholder">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="product-table-name-cell">
                        <span className="product-table-name">{product.name}</span>
                        <span className="product-table-slug">{product.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {product.category || product.category_name || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>
                          {formatPrice(product.price, unit)}
                        </span>
                        {costPrice !== null && costPrice !== undefined && (
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            Tannarx: {formatPrice(costPrice, unit)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-primary)', fontSize: 12 }}>
                        {length && width ? `${length} × ${width} sm` : (sizesCount > 0 ? `${sizesCount} xil o‘lcham` : 'Standart')}
                      </span>
                      {thickness ? (
                        <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11 }}>
                          {thickness} mm
                        </span>
                      ) : null}
                    </td>
                    <td>
                      {pieces || boxM2 ? (
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {pieces ? `${pieces} dona` : ''}
                          {pieces && boxM2 ? ' · ' : ''}
                          {boxM2 ? `${boxM2} m²` : ''}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>
                      {stock !== null && stock !== undefined ? (
                        <span style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 500 }}>
                          {stock} {unit === 'piece' ? 'dona' : unit}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`product-status-badge ${
                          isVisible ? 'is-visible' : 'is-hidden'
                        }`}
                      >
                        {isVisible ? 'Faol' : 'Yashirin'}
                      </span>
                    </td>
                    <td>
                      <div className="product-actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <Link
                          to={`/products/${product.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="table-action-btn"
                          title="Saytda ko‘rish"
                          aria-label={`${product.name}ni saytda ko‘rish`}
                        >
                          <ExternalLink size={15} />
                        </Link>

                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => onToggleVisibility(product)}
                          title={isVisible ? 'Yashirish' : 'Ko‘rsatish'}
                          aria-label={isVisible ? 'Mahsulotni yashirish' : 'Mahsulotni ko‘rsatish'}
                        >
                          {isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>

                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => onEdit(product)}
                          title="Tahrirlash"
                          aria-label={`${product.name}ni tahrirlash`}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="table-action-btn is-delete"
                          onClick={() => onDelete(product)}
                          title="O‘chirish"
                          aria-label={`${product.name}ni o‘chirish`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

