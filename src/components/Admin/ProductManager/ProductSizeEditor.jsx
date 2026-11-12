import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import './ProductSizeEditor.css';

export default function ProductSizeEditor({ sizes = [], onChange }) {
  const handleAdd = () => {
    const updated = [
      ...sizes,
      { widthCm: 30, lengthCm: 60, thicknessMm: 20 }
    ];
    onChange(updated);
  };

  const handleUpdate = (index, field, value) => {
    const num = parseFloat(value) || 0;
    const updated = sizes.map((s, i) => {
      if (i !== index) return s;
      return { ...s, [field]: num };
    });
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = sizes.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="product-size-editor">
      <div className="size-editor-header">
        <span className="size-editor-title">Mavjud o‘lchamlar</span>
        <button
          type="button"
          className="size-add-btn"
          onClick={handleAdd}
        >
          <Plus size={14} />
          <span>O‘lcham qo‘shish</span>
        </button>
      </div>

      {sizes.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
          Hozircha o‘lchamlar kiritilmagan. Standart o‘lcham qo‘shish uchun yuqoridagi tugmani bosing.
        </p>
      ) : (
        <div className="size-editor-rows">
          {sizes.map((size, index) => (
            <div key={index} className="size-editor-row">
              <div className="size-input-group">
                <label className="size-input-label">Kenglik (sm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={size.widthCm ?? 0}
                  onChange={(e) => handleUpdate(index, 'widthCm', e.target.value)}
                  className="size-input-field"
                  placeholder="sm"
                />
              </div>

              <div className="size-input-group">
                <label className="size-input-label">Uzunlik (sm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={size.lengthCm ?? 0}
                  onChange={(e) => handleUpdate(index, 'lengthCm', e.target.value)}
                  className="size-input-field"
                  placeholder="sm"
                />
              </div>

              <div className="size-input-group">
                <label className="size-input-label">Qalinlik (mm)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={size.thicknessMm ?? 0}
                  onChange={(e) => handleUpdate(index, 'thicknessMm', e.target.value)}
                  className="size-input-field"
                  placeholder="mm"
                />
              </div>

              <button
                type="button"
                className="size-remove-btn"
                onClick={() => handleRemove(index)}
                title="O‘chirish"
                aria-label={`O‘lcham ${index + 1}ni o‘chirish`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

