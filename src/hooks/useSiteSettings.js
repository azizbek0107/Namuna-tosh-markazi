import { useState, useEffect } from 'react';
import { settingsService, defaultSettings } from '../services/settingsService.js';

export function useSiteSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await settingsService.fetchSettings();
        if (isMounted && data) {
          setSettings(data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    const handleSync = () => {
      load();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('namuna:settings-updated', handleSync);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('namuna:settings-updated', handleSync);
      }
    };
  }, []);

  return { settings, loading };
}

export default useSiteSettings;

