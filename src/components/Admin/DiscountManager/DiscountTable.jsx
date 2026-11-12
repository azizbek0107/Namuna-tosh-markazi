import React from 'react';
import { Plus, Pencil, Trash2, Power, Tag } from 'lucide-react';
import { formatMoney } from '../../../utils/priceUtils';
import './DiscountTable.css';

export default function DiscountTable({
  discounts = [],
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  loading = false
}) {
  const getStatusBadge = (discount) => {
    if (!discount.isActive && !discount.is_active) {
      return <span className="discount-status-badge disabled">O‘chirilgan</span>;
    }
    const now = new Date();
    const start = discount.startDate || discount.starts_at ? new Date(discount.startDate || discount.starts_at) : null;
    const end = discount.endDate || discount.ends_at ? new Date(discount.endDate || discount.ends_at) : null;

    if (start && now < start) {
      return <span className="discount-status-badge scheduled">Rejalashtirilgan</span>;
    }
    if (end && now > end) {
      return <span className="discount-status-badge expired">Muddati o‘tgan</span>;
    }
    return <span className="discount-status-badge active">Faol</span>;
  };

  return (
    <div className="discount-table-wrapper">
      <div className="discount-table-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag size={18} style={{ color: 'var(--gold-primary)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Chegirmalar ro‘yxati ({discounts.length})
          </span>
        </div>

        {onAdd && (
          <button
            type="button"
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
            <span>Yangi chegirma</span>
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="discount-table">
          <thead>
            <tr>
              <th>Mahsulot</th>
              <th>Turi</th>
              <th>Miqdor</th>
              <th>Amal qilish muddati</th>
              <th>Holat</th>
              <th style={{ textAlign: 'right', width: 120 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  Hozircha chegirmalar mavjud emas
                </td>
              </tr>
            ) : (
              discounts.map((discount) => {
                const productName = discount.productName || discount.product?.name || 'Barcha mahsulotlar';
                const isPercent = (discount.type || discount.discount_type) === 'percentage';
                const val = discount.value ?? discount.discount_value ?? 0;
                const startDate = discount.startDate || discount.starts_at || 'Cheksiz';
                const endDate = discount.endDate || discount.ends_at || 'Cheksiz';
                const isActive = Boolean(discount.isActive ?? discount.is_active);

                return (
                  <tr key={discount.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {productName}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                        {isPercent ? 'Foiz (%)' : 'Belgilangan (so‘m)'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                        {isPercent ? `${val}%` : formatMoney(val)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {startDate} — {endDate}
                      </span>
                    </td>
                    <td>{getStatusBadge(discount)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => onToggle(discount)}
                          title={isActive ? 'O‘chirish' : 'Yoqish'}
                          aria-label={isActive ? 'Chegirmani o‘chirish' : 'Chegirmani yoqish'}
                          style={{ color: isActive ? '#6abf6e' : 'var(--text-secondary)' }}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => onEdit(discount)}
                          title="Tahrirlash"
                          aria-label="Chegirmani tahrirlash"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn is-delete"
                          onClick={() => onDelete(discount)}
                          title="O‘chirish"
                          aria-label="Chegirmani butunlay o‘chirish"
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

