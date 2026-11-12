import { useEffect, useState } from 'react';
import { getCountdown } from '../utils/discountUtils';

export function useCurrentTime(enabled = true) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!enabled) return;
    const sync = () => setNow(Date.now());
    sync();
    const interval = setInterval(sync, 1000);
    // Resume with current wall clock after sleeping or switching browser tabs.
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => { clearInterval(interval); window.removeEventListener('focus', sync); document.removeEventListener('visibilitychange', sync); };
  }, [enabled]);
  return now;
}
export default function useCountdown(endDate, providedNow) {
  const localNow = useCurrentTime(Boolean(endDate) && providedNow === undefined);
  return getCountdown(endDate, providedNow ?? localNow);
}
