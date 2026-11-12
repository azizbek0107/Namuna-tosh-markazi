import React, { useState, useEffect } from 'react';
import { Phone, Send, MapPin, Clock, Save, CheckCircle, Loader2 } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import LoadingState from '../../components/Admin/Shared/LoadingState';
import ErrorState from '../../components/Admin/Shared/ErrorState';
import './AdminSettings.css';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    phone1: '',
    phone2: '',
    telegramUsername: '',
    telegramPhone: '',
    instagram: '',
    address: '',
    workingHours: '',
    email: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.fetchSettings();
      setFormData({
        phone1: data.phone1 || '+998 90 123 45 67',
        phone2: data.phone2 || '+998 93 765 43 21',
        telegramUsername: data.telegramUsername || data.telegram_username || 'namunatoshjilo',
        telegramPhone: data.telegramPhone || data.telegram_phone || '+998901234567',
        instagram: data.instagram || 'namunatoshjilo',
        address: data.address || 'Navoiy viloyati, G‘azg‘on shahri, Toshchilar ko‘chasi, 12-uy',
        workingHours: data.workingHours || data.working_hours || 'Dushanba - Shanba: 08:00 - 18:00',
        email: data.email || 'info@namunatosh.uz'
      });
    } catch (err) {
      setError(err.message || 'Sozlamalarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMessage('');
      await settingsService.updateSettings(formData);
      setSuccessMessage('Sayt ma‘lumotlari va aloqa sozlamalari muvaffaqiyatli yangilandi!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Sozlamalarni saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Sozlamalar yuklanmoqda..." />;
  if (error) return <ErrorState message={error} onRetry={loadSettings} />;

  return (
    <div className="admin-settings-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Sayt va aloqa sozlamalari</h1>
          <p className="admin-page-subtitle">
            Sayt bo‘ylab ko‘rinadigan aloqa ma‘lumotlari va ish rejimini tahrirlash
          </p>
        </div>
      </div>

      {successMessage && (
        <div
          style={{
            padding: '12px 18px',
            background: 'rgba(106, 191, 110, 0.12)',
            border: '1px solid rgba(106, 191, 110, 0.4)',
            borderRadius: 3,
            color: '#6abf6e',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 550
          }}
        >
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-card">
        <h2 className="settings-card-title">
          <Phone size={18} style={{ color: 'var(--gold-primary)' }} />
          Telefon raqamlari va Telegram
        </h2>

        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label">Asosiy telefon raqam</label>
            <input
              type="text"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              className="form-input"
              placeholder="+998 90 123 45 67"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Qo‘shimcha telefon raqam</label>
            <input
              type="text"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              className="form-input"
              placeholder="+998 93 765 43 21"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label">Telegram foydalanuvchi nomi (@sizsiz)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Send size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-secondary)' }} />
              <input
                type="text"
                name="telegramUsername"
                value={formData.telegramUsername}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: 34, width: '100%' }}
                placeholder="namunatoshjilo"
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Instagram sahifasi</label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              className="form-input"
              placeholder="namunatoshjilo"
            />
          </div>
        </div>

        <h2 className="settings-card-title" style={{ marginTop: 12 }}>
          <MapPin size={18} style={{ color: 'var(--gold-primary)' }} />
          Manzil va ish tartibi
        </h2>

        <div className="form-field">
          <label className="form-label">Korxona manzili</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-input"
            placeholder="Navoiy viloyati, G‘azg‘on shahri..."
          />
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label">Ish kunlari va soatlari</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Clock size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-secondary)' }} />
              <input
                type="text"
                name="workingHours"
                value={formData.workingHours}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: 34, width: '100%' }}
                placeholder="Dushanba - Shanba: 08:00 - 18:00"
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Aloqa elektron pochtasi</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="info@namunatosh.uz"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            type="submit"
            className="form-submit-btn"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Sozlamalarni saqlash</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

