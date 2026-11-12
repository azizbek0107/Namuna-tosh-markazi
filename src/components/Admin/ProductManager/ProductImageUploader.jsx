import React, { useState, useRef } from 'react';
import { UploadCloud, Plus, Trash2, Star, Link as LinkIcon, Loader2 } from 'lucide-react';
import { storageService } from '../../../services/storageService';
import './ProductImageUploader.css';

export default function ProductImageUploader({ images = [], onChange }) {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Normalize images to array of { id, url, isPrimary }
  const normalizedImages = (images || []).map((img, index) => {
    if (typeof img === 'string') {
      return { id: `img-${index}`, url: img, isPrimary: index === 0 };
    }
    return {
      id: img.id || `img-${index}`,
      url: img.url || img.image_url || '',
      isPrimary: Boolean(img.isPrimary ?? img.is_primary ?? index === 0)
    };
  });

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const newImages = [...normalizedImages];
      for (const file of files) {
        const { url, error } = await storageService.uploadProductImage(file);
        if (error) {
          throw new Error(error.message || 'Yuklashda xatolik yuz berdi');
        }
        newImages.push({
          id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          url,
          isPrimary: newImages.length === 0
        });
      }
      onChange(newImages);
    } catch (err) {
      setUploadError(err.message || 'Rasm yuklashda xatolik yuz berdi');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const newImages = [
      ...normalizedImages,
      {
        id: `url-${Date.now()}`,
        url: trimmed,
        isPrimary: normalizedImages.length === 0
      }
    ];
    onChange(newImages);
    setUrlInput('');
  };

  const handleSetPrimary = (index) => {
    const updated = normalizedImages.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    onChange(updated);
  };

  const handleRemove = (index) => {
    const wasPrimary = normalizedImages[index]?.isPrimary;
    const updated = normalizedImages.filter((_, i) => i !== index);
    if (wasPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  return (
    <div className="product-image-uploader">
      <span className="uploader-title">Mahsulot rasmlari</span>

      <div
        className="uploader-dropzone"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {isUploading ? (
          <>
            <Loader2 size={24} className="spin-icon" style={{ color: 'var(--gold-primary)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Rasm yuklanmoqda...</span>
          </>
        ) : (
          <>
            <UploadCloud size={28} style={{ color: 'var(--gold-primary)' }} />
            <span style={{ fontSize: 13, fontWeight: 550, color: 'var(--text-primary)' }}>
              Fayllarni tanlash uchun bosing yoki shu yerga tashlang
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              PNG, JPG, WEBP formatlari qo‘llab-quvvatlanadi
            </span>
          </>
        )}
      </div>

      <div className="uploader-url-row">
        <input
          type="url"
          placeholder="Yoki to‘g‘ridan-to‘g‘ri rasm URL manzilini kiriting..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
          className="uploader-url-input"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="uploader-url-btn"
        >
          <LinkIcon size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
          URL qo‘shish
        </button>
      </div>

      {uploadError && (
        <span style={{ fontSize: 12, color: '#ff6b6b' }}>{uploadError}</span>
      )}

      {normalizedImages.length > 0 && (
        <div className="uploader-gallery">
          {normalizedImages.map((img, index) => (
            <div
              key={img.id || index}
              className={`uploader-thumb-card ${img.isPrimary ? 'is-primary' : ''}`}
            >
              <img
                src={img.url}
                alt={`Mahsulot rasmi ${index + 1}`}
                className="uploader-thumb-img"
              />
              {img.isPrimary && (
                <span className="uploader-primary-badge">Asosiy</span>
              )}
              <div className="uploader-thumb-actions">
                <button
                  type="button"
                  className="uploader-icon-btn"
                  onClick={() => handleSetPrimary(index)}
                  title={img.isPrimary ? 'Asosiy rasm' : 'Asosiy deb belgilash'}
                >
                  <Star
                    size={14}
                    fill={img.isPrimary ? 'var(--gold-primary)' : 'none'}
                    color={img.isPrimary ? 'var(--gold-primary)' : '#fff'}
                  />
                </button>
                <button
                  type="button"
                  className="uploader-icon-btn is-delete"
                  onClick={() => handleRemove(index)}
                  title="Rasmni o‘chirish"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

