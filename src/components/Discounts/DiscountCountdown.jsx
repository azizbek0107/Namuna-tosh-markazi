import useCountdown from '../../hooks/useCountdown';
import { formatDiscountEnd } from '../../utils/discountUtils';
import { discountBoundary } from '../../utils/priceUtils';
import useLanguage from '../../hooks/useLanguage';
import './DiscountCountdown.css';

export default function DiscountCountdown({ endDate, now }) {
  const remaining = useCountdown(endDate, now);
  const { t } = useLanguage();

  if (!remaining) return null;
  if (remaining.ended) {
    return (
      <p className="discount-countdown-ended" role="status">
        {t('discounts.ended', 'Aksiya yakunlandi')}
      </p>
    );
  }

  const units = [
    [remaining.days, t('time.days', 'kun')],
    [remaining.hours, t('time.hours', 'soat')],
    [remaining.minutes, t('time.minutes', 'daqiqa')],
    [remaining.seconds, t('time.seconds', 'soniya')],
  ];

  return (
    <div className="discount-countdown">
      <p>
        {t('discounts.ends_at', 'Tugash vaqti:')}{' '}
        <time dateTime={new Date(discountBoundary(endDate, true)).toISOString()}>
          {formatDiscountEnd(endDate)}
        </time>{' '}
        (Toshkent)
      </p>
      <div
        className="discount-countdown-clock"
        role="timer"
        aria-live="off"
        aria-label={t('discounts.countdown_label', 'Aksiya tugashiga qolgan vaqt')}
      >
        {units.map(([number, label]) => (
          <span key={label}>
            <b>{String(number).padStart(2, '0')}</b>
            <small>{label}</small>
          </span>
        ))}
      </div>
    </div>
  );
}
