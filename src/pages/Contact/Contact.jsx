import React from "react";
import { Send, Phone, MapPin, Clock } from "lucide-react";
import PagePlaceholder from "../../components/PagePlaceholder";
import useSiteSettings from "../../hooks/useSiteSettings";
import { useLanguage } from "../../hooks/useLanguage";
import "./Contact.css";

export default function Contact() {
  const { settings } = useSiteSettings();
  const { t } = useLanguage();
  const telegramHandle = settings?.telegramUsername || "aura_200707";
  const cleanTelegram = telegramHandle.replace(/^@/, '');
  const telegramUrl = `https://t.me/${cleanTelegram}`;

  return (
    <div className="contact-page">
      <PagePlaceholder
        number="04"
        eyebrow={t('contact.eyebrow', 'BOG‘LANISH')}
        title={t('contact.title', 'Suhbatdan boshlaymiz.')}
        description={t('contact.description', 'Mahsulot, o‘lcham va buyurtma bo‘yicha savollaringizni Telegram orqali yuboring. Loyihangiz haqida yozib qoldiring.')}
        icon={Send}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <a
            className="contact-account"
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{cleanTelegram} <span>{t('contact.telegram_sub', 'Telegram · yangi oynada ochiladi ↗')}</span>
          </a>

          {(settings?.phone1 || settings?.phone2) && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', fontSize: 14 }}>
              {settings.phone1 && (
                <a
                  href={`tel:${settings.phone1.replace(/\s+/g, '')}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', textDecoration: 'none' }}
                >
                  <Phone size={15} style={{ color: 'var(--gold-primary)' }} />
                  <span>{settings.phone1}</span>
                </a>
              )}
              {settings.phone2 && (
                <a
                  href={`tel:${settings.phone2.replace(/\s+/g, '')}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none' }}
                >
                  <Phone size={15} style={{ color: 'var(--gold-primary)' }} />
                  <span>{settings.phone2}</span>
                </a>
              )}
            </div>
          )}

          {settings?.address && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', maxWidth: 450, textAlign: 'center' }}>
              <MapPin size={15} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
              <span>{settings.address}</span>
            </div>
          )}

          {settings?.workingHours && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <Clock size={14} style={{ color: 'var(--gold-primary)' }} />
              <span>{settings.workingHours}</span>
            </div>
          )}
        </div>
      </PagePlaceholder>
    </div>
  );
}
